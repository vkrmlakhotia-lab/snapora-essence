import { useState, useRef } from 'react'
import { MapPin, Calendar, User, Clock, ChevronRight, Check, ImageIcon, Loader2 } from 'lucide-react'
import type { BookPhoto } from '@/types/book'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RichPhoto {
  bookPhoto: BookPhoto
  file: File
  date: Date | null
  lat: number | null
  lon: number | null
  location?: string   // reverse-geocoded or clustered label
}

type Category = 'trips' | 'events' | 'people' | 'timeframe'

interface Props {
  onImport: (photos: BookPhoto[]) => void
}

// ─── EXIF parsing ─────────────────────────────────────────────────────────────

async function parseExif(file: File): Promise<{ date: Date | null; lat: number | null; lon: number | null }> {
  try {
    const exifr = await import('exifr')
    const data = await exifr.parse(file, { gps: true, tiff: true, exif: true })
    if (!data) return { date: null, lat: null, lon: null }

    const date = data.DateTimeOriginal
      ? new Date(data.DateTimeOriginal)
      : data.CreateDate
      ? new Date(data.CreateDate)
      : null

    const lat = typeof data.latitude === 'number' ? data.latitude : null
    const lon = typeof data.longitude === 'number' ? data.longitude : null

    return { date, lat, lon }
  } catch {
    return { date: null, lat: null, lon: null }
  }
}

// ─── Clustering helpers ───────────────────────────────────────────────────────

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function clusterByLocation(photos: RichPhoto[], thresholdKm = 80): Map<string, RichPhoto[]> {
  const clusters = new Map<string, RichPhoto[]>()
  const geoPhotos = photos.filter(p => p.lat !== null && p.lon !== null)
  const noGeoPhotos = photos.filter(p => p.lat === null || p.lon === null)

  const assigned = new Set<string>()
  let clusterIdx = 0

  for (const photo of geoPhotos) {
    if (assigned.has(photo.bookPhoto.id)) continue
    const key = `Trip ${clusterIdx + 1}`
    const group = [photo]
    assigned.add(photo.bookPhoto.id)

    for (const other of geoPhotos) {
      if (assigned.has(other.bookPhoto.id)) continue
      const dist = haversineKm(photo.lat!, photo.lon!, other.lat!, other.lon!)
      if (dist <= thresholdKm) {
        group.push(other)
        assigned.add(other.bookPhoto.id)
      }
    }

    clusters.set(key, group)
    clusterIdx++
  }

  if (noGeoPhotos.length) clusters.set('No location', noGeoPhotos)
  return clusters
}

function clusterByDay(photos: RichPhoto[]): Map<string, RichPhoto[]> {
  const clusters = new Map<string, RichPhoto[]>()
  const noDate: RichPhoto[] = []

  for (const photo of photos) {
    if (!photo.date) { noDate.push(photo); continue }
    const key = photo.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    if (!clusters.has(key)) clusters.set(key, [])
    clusters.get(key)!.push(photo)
  }

  if (noDate.length) clusters.set('No date', noDate)
  return clusters
}

function filterByDateRange(photos: RichPhoto[], from: Date, to: Date): RichPhoto[] {
  return photos.filter(p => {
    if (!p.date) return false
    return p.date >= from && p.date <= to
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const CategoryCard = ({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className="w-full bg-card rounded-xl p-4 card-shadow flex items-center gap-4 hover:bg-accent transition-colors text-left"
  >
    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon size={18} strokeWidth={1.5} className="text-primary" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
    <ChevronRight size={16} strokeWidth={1.5} className="text-muted-foreground" />
  </button>
)

// ─── Main component ───────────────────────────────────────────────────────────

type Step = 'permission' | 'category' | 'uploading' | 'options' | 'selecting'

const ApplePhotosImport = ({ onImport }: Props) => {
  const [step, setStep] = useState<Step>('permission')
  const [category, setCategory] = useState<Category | null>(null)
  const [allPhotos, setAllPhotos] = useState<RichPhoto[]>([])
  const [analysing, setAnalysing] = useState(false)

  // Options step state
  const [tripClusters, setTripClusters] = useState<Map<string, RichPhoto[]>>(new Map())
  const [eventClusters, setEventClusters] = useState<Map<string, RichPhoto[]>>(new Map())
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [personName, setPersonName] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Photo selection state
  const [displayedPhotos, setDisplayedPhotos] = useState<RichPhoto[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fileRef = useRef<HTMLInputElement>(null)

  // ── File upload + EXIF analysis ───────────────────────────────────────────

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setAnalysing(true)
    setStep('uploading')

    const rich: RichPhoto[] = await Promise.all(
      Array.from(files).map(async file => {
        const { date, lat, lon } = await parseExif(file)
        return {
          bookPhoto: {
            id: crypto.randomUUID(),
            url: URL.createObjectURL(file),
            file,
          },
          file,
          date,
          lat,
          lon,
        }
      })
    )

    setAllPhotos(rich)
    setAnalysing(false)

    if (category === 'trips') {
      const clusters = clusterByLocation(rich)
      setTripClusters(clusters)
      setStep('options')
    } else if (category === 'events') {
      const clusters = clusterByDay(rich)
      setEventClusters(clusters)
      setStep('options')
    } else if (category === 'people') {
      // No server-side face detection in browser — show all photos for manual selection
      setDisplayedPhotos(rich)
      setSelectedIds(new Set(rich.map(p => p.bookPhoto.id)))
      setStep('selecting')
    } else if (category === 'timeframe') {
      setStep('options')
    }
  }

  // ── Options confirmed → filter → show selection ───────────────────────────

  const handleOptionConfirm = () => {
    let filtered: RichPhoto[] = []

    if (category === 'trips' && selectedOption) {
      filtered = tripClusters.get(selectedOption) || []
    } else if (category === 'events' && selectedOption) {
      filtered = eventClusters.get(selectedOption) || []
    } else if (category === 'timeframe' && dateFrom && dateTo) {
      filtered = filterByDateRange(allPhotos, new Date(dateFrom), new Date(dateTo))
    } else if (category === 'people') {
      filtered = allPhotos
    }

    setDisplayedPhotos(filtered)
    setSelectedIds(new Set(filtered.map(p => p.bookPhoto.id)))
    setStep('selecting')
  }

  const togglePhoto = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleConfirmSelection = () => {
    const selected = displayedPhotos
      .filter(p => selectedIds.has(p.bookPhoto.id))
      .map(p => p.bookPhoto)
    onImport(selected)
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  // STEP: Permission
  if (step === 'permission') {
    return (
      <div className="flex flex-col items-center text-center px-4 py-6 animate-fade-in">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <ImageIcon size={28} strokeWidth={1.5} className="text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground mb-1">Access Your Photos</h2>
        <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed mb-6">
          Snapora needs access to your photos to create your book. Your photos stay private and are only used for your book.
        </p>
        <button
          onClick={() => setStep('category')}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Allow Access
        </button>
        <p className="text-[10px] text-muted-foreground mt-3">
          Photos are uploaded securely and only visible to you.
        </p>
      </div>
    )
  }

  // STEP: Category
  if (step === 'category') {
    return (
      <div className="space-y-3 animate-fade-in">
        <p className="text-xs text-muted-foreground font-medium px-1">What would you like to create a book about?</p>
        <CategoryCard
          icon={MapPin}
          title="Recent Trips"
          description="Group photos by location — perfect for holidays"
          onClick={() => { setCategory('trips'); fileRef.current?.click() }}
        />
        <CategoryCard
          icon={Calendar}
          title="Events"
          description="Birthdays, weddings, gatherings — grouped by date"
          onClick={() => { setCategory('events'); fileRef.current?.click() }}
        />
        <CategoryCard
          icon={User}
          title="Certain People"
          description="Select photos featuring specific family or friends"
          onClick={() => { setCategory('people'); fileRef.current?.click() }}
        />
        <CategoryCard
          icon={Clock}
          title="Time Frame"
          description="Choose photos from a specific date range"
          onClick={() => { setCategory('timeframe'); fileRef.current?.click() }}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>
    )
  }

  // STEP: Uploading / analysing
  if (step === 'uploading') {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <Loader2 size={28} strokeWidth={1.5} className="text-primary animate-spin mb-4" />
        <p className="text-sm font-medium text-foreground">Analysing your photos…</p>
        <p className="text-xs text-muted-foreground mt-1">Reading dates and locations</p>
      </div>
    )
  }

  // STEP: Options (trips, events, timeframe)
  if (step === 'options') {
    // Trips
    if (category === 'trips') {
      const entries = Array.from(tripClusters.entries())
      return (
        <div className="space-y-3 animate-fade-in">
          <p className="text-xs text-muted-foreground font-medium px-1">
            We found {entries.length} location{entries.length !== 1 ? 's' : ''} in your photos. Pick one:
          </p>
          {entries.map(([label, photos]) => (
            <button
              key={label}
              onClick={() => setSelectedOption(label)}
              className={`w-full rounded-xl p-4 card-shadow flex items-center gap-3 transition-colors text-left ${
                selectedOption === label ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
              }`}
            >
              <MapPin size={16} strokeWidth={1.5} className={selectedOption === label ? 'text-primary-foreground' : 'text-primary'} />
              <div className="flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className={`text-xs mt-0.5 ${selectedOption === label ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {photos.length} photo{photos.length !== 1 ? 's' : ''}
                  {photos[0]?.date ? ` · ${photos[0].date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}` : ''}
                </p>
              </div>
              {selectedOption === label && <Check size={16} strokeWidth={2} />}
            </button>
          ))}
          <button
            onClick={handleOptionConfirm}
            disabled={!selectedOption}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-30 mt-2"
          >
            Show Photos →
          </button>
        </div>
      )
    }

    // Events
    if (category === 'events') {
      const entries = Array.from(eventClusters.entries()).filter(([k]) => k !== 'No date')
      const noDate = eventClusters.get('No date') || []
      return (
        <div className="space-y-3 animate-fade-in">
          <p className="text-xs text-muted-foreground font-medium px-1">
            Found {entries.length} day{entries.length !== 1 ? 's' : ''} with photos. Pick one:
          </p>
          {entries.map(([label, photos]) => (
            <button
              key={label}
              onClick={() => setSelectedOption(label)}
              className={`w-full rounded-xl p-4 card-shadow flex items-center gap-3 transition-colors text-left ${
                selectedOption === label ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
              }`}
            >
              <Calendar size={16} strokeWidth={1.5} className={selectedOption === label ? 'text-primary-foreground' : 'text-primary'} />
              <div className="flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className={`text-xs mt-0.5 ${selectedOption === label ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {photos.length} photo{photos.length !== 1 ? 's' : ''}
                </p>
              </div>
              {selectedOption === label && <Check size={16} strokeWidth={2} />}
            </button>
          ))}
          {noDate.length > 0 && (
            <button
              onClick={() => setSelectedOption('No date')}
              className={`w-full rounded-xl p-4 card-shadow flex items-center gap-3 transition-colors text-left ${
                selectedOption === 'No date' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
              }`}
            >
              <Calendar size={16} strokeWidth={1.5} className="text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Unknown date</p>
                <p className="text-xs text-muted-foreground">{noDate.length} photos</p>
              </div>
              {selectedOption === 'No date' && <Check size={16} strokeWidth={2} />}
            </button>
          )}
          <button
            onClick={handleOptionConfirm}
            disabled={!selectedOption}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-30 mt-2"
          >
            Show Photos →
          </button>
        </div>
      )
    }

    // Time Frame
    if (category === 'timeframe') {
      const dates = allPhotos.map(p => p.date).filter(Boolean) as Date[]
      const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null
      const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null
      const fmt = (d: Date) => d.toISOString().split('T')[0]

      return (
        <div className="space-y-4 animate-fade-in">
          <p className="text-xs text-muted-foreground font-medium px-1">
            Your photos span{' '}
            {minDate && maxDate
              ? `${minDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} – ${maxDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
              : 'an unknown date range'}
            . Pick a window:
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">From</label>
              <input
                type="date"
                value={dateFrom || (minDate ? fmt(minDate) : '')}
                min={minDate ? fmt(minDate) : undefined}
                max={maxDate ? fmt(maxDate) : undefined}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full mt-1.5 h-12 px-4 bg-card rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">To</label>
              <input
                type="date"
                value={dateTo || (maxDate ? fmt(maxDate) : '')}
                min={minDate ? fmt(minDate) : undefined}
                max={maxDate ? fmt(maxDate) : undefined}
                onChange={e => setDateTo(e.target.value)}
                className="w-full mt-1.5 h-12 px-4 bg-card rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <button
            onClick={handleOptionConfirm}
            disabled={!dateFrom || !dateTo}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            Show Photos →
          </button>
        </div>
      )
    }
  }

  // STEP: Photo selection
  if (step === 'selecting') {
    const selectedCount = selectedIds.size
    return (
      <div className="space-y-4 animate-fade-in">
        {category === 'people' && (
          <div>
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Who is this book about?</label>
            <input
              type="text"
              value={personName}
              onChange={e => setPersonName(e.target.value)}
              placeholder="e.g. Grandma, The kids, Maya"
              className="w-full mt-1.5 h-10 px-4 bg-card rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {displayedPhotos.length} photo{displayedPhotos.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedIds(new Set(displayedPhotos.map(p => p.bookPhoto.id)))}
              className="text-xs text-primary font-medium"
            >
              Select all
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-muted-foreground font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {displayedPhotos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No photos found for this selection.</p>
            <button onClick={() => setStep('options')} className="text-xs text-primary mt-2">← Go back</button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {displayedPhotos.map(photo => {
              const isSelected = selectedIds.has(photo.bookPhoto.id)
              return (
                <button
                  key={photo.bookPhoto.id}
                  onClick={() => togglePhoto(photo.bookPhoto.id)}
                  className="aspect-square rounded-lg overflow-hidden relative"
                >
                  <img src={photo.bookPhoto.url} alt="" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 transition-opacity ${isSelected ? 'opacity-0' : 'opacity-50 bg-background'}`} />
                  <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-primary border-primary' : 'border-white/80 bg-black/20'
                  }`}>
                    {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                  </div>
                  {photo.date && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-1.5 py-0.5">
                      <p className="text-[8px] text-white/80">{photo.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <button
          onClick={handleConfirmSelection}
          disabled={selectedCount === 0}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-30 sticky bottom-0"
        >
          Add {selectedCount} Photo{selectedCount !== 1 ? 's' : ''} to Book
        </button>
      </div>
    )
  }

  return null
}

export default ApplePhotosImport
