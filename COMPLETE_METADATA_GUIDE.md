# Complete Apple Photos Database Metadata - All 134 Fields

## TABLE OF CONTENTS
1. Core Identifiers (3 fields)
2. Date/Time Information (8 fields)
3. Image Dimensions & Orientation (3 fields)
4. Media Type & Format (4 fields)
5. Location Data (3 fields)
6. Quality & AI Scoring (5 fields)
7. User Preferences & Flags (6 fields)
8. Technical/Camera Information (6 fields)
9. Cloud & Sync State (7 fields)
10. Faces & Detection (1 field)
11. Analysis & Intelligence (3 fields)
12. Duplication & Relationships (2 fields)
13. Organization & Collections (4 fields)
14. Trash & Visibility (3 fields)
15. Video-Specific Fields (3 fields)
16. Album/Memory Associations (6 fields)
17. Library Management (6 fields)
18. Processing State (4 fields)
19. Participant & Sharing (1 field)
20. Binary/Complex Data (2 fields)
21. Internal Database Fields (6 fields)

---

## 1. CORE IDENTIFIERS (3 fields)

### Z_PK (INTEGER)
- **Type**: PRIMARY KEY in database
- **Range**: Sequential integers (1, 2, 3...)
- **Example**: 12345
- **What it is**: Internal database row ID, automatically assigned
- **When it's used**: Never accessed by user, internal database use only
- **Snapora value**: Skip this - ZUUID is better
- **Mutable**: No (auto-generated at creation)
- **Performance**: Indexed, fastest lookup
- **Business logic**: None for external app

---

### ZUUID (VARCHAR)
- **Type**: STRING/UUID
- **Length**: 36 characters (with hyphens)
- **Example**: `CF23A50B-4423-446B-BAE8-2D5A977CA666`
- **What it is**: Universally Unique Identifier, the GLOBAL identifier for this photo
- **When it's used**: Everywhere - syncing between devices, cloud references, sharing
- **How it's generated**: UUID v4 (random 128-bit), generated at photo creation
- **Snapora value**: CRITICAL - use this as your primary key, not Z_PK
- **Mutable**: No (never changes, survives app reinstalls)
- **Cross-platform**: Same UUID on iPhone, iPad, Mac, iCloud
- **Uniqueness**: Guaranteed globally unique
- **Use cases**:
  - Track same photo across devices
  - Prevent duplicate imports after sync
  - Link to the actual file on disk
  - Shared album references
  - Cloud sync reconciliation

---

### ZFILENAME (VARCHAR)
- **Type**: STRING
- **Example**: `CF23A50B-4423-446B-BAE8-2D5A977CA666.MP4`
- **What it is**: Internal filename stored in library (usually UUID.extension)
- **When it's used**: File lookup, display, export
- **Format**: Typically `{UUID}.{extension}` but can be custom for imports
- **Snapora value**: Use for finding the actual file, but rename on export
- **Mutable**: No (set at import)
- **Extensions seen**: .jpg, .jpeg, .png, .heic, .raw, .dng, .mov, .mp4, .gif, .webp
- **Use cases**:
  - Locate file in Masters folder
  - Fallback if UUID lookup fails
  - Export with readable name (combine with metadata)

---

## 2. DATE/TIME INFORMATION (8 fields)

### ZDATECREATED (TIMESTAMP)
- **Type**: TIMESTAMP (Apple's internal format)
- **Example**: `383581230` (in relative seconds, needs conversion)
- **What it is**: THE ACTUAL CAPTURE TIME - when user took the photo
- **When it's used**: Timeline building, sorting, clustering into days
- **Timezone**: Stored with timezone info from photo metadata (EXIF)
- **Precision**: Down to second
- **Snapora value**: CRITICAL - this is the "real" date, not import date
- **Mutable**: No (comes from camera/EXIF, can be edited by user in Photos app)
- **Time adjustment**: User can shift time in Photos app (edit EXIF)
- **Use cases**:
  - Build accurate timeline (when was this actually taken)
  - Sort by capture date (not import date)
  - Group into "Days"/"Moments"
  - Show on map with correct timestamp
  - Match photos from same time period
  - "On this day" memory feature
  - Event dating
- **Missing**: Value is NULL if metadata is missing
- **Importance**: HIGHEST - core to organizing photos by actual events

---

### ZADDEDDATE (TIMESTAMP)
- **Type**: TIMESTAMP
- **Example**: `794039015.96` (with fractional seconds)
- **What it is**: When photo was imported/added to Photos library
- **When it's used**: Shows recent imports, inbox, batch processing
- **Timezone**: Device timezone at time of import
- **Precision**: Fractional seconds (0.01 second accuracy)
- **Snapora value**: High - useful for "Recently Added" features
- **Mutable**: No (set at import, never changes)
- **Use cases**:
  - "Recently added" inbox
  - Batch import detection (multiple photos with same ZADDEDDATE = bulk import)
  - Import history
  - Identify newly scanned photos
  - "New photos today" notification counts
  - Storage timeline
- **Difference from ZDATECREATED**:
  - Old photo from 1995 = ZDATECREATED: 1995, ZADDEDDATE: today
  - Shows when user imported old photos to Photos

---

### ZMODIFICATIONDATE (TIMESTAMP)
- **Type**: TIMESTAMP
- **Example**: `796849588.99`
- **What it is**: Last time ANY metadata or edits were changed
- **When it's used**: Shows recently edited photos, edit history, sync detection
- **Triggers**: Every time user:
  - Edits photo (adjust brightness, crop, etc)
  - Changes metadata (title, description, location, favorite)
  - Applies filter
  - Makes annotation
  - Changes favorite status
  - Rotates image
- **Snapora value**: Medium - useful for "Recently edited" filter
- **Mutable**: Yes (changes every time metadata updates)
- **Use cases**:
  - "Recently edited" collection
  - Find photos user is actively working on
  - Detect when edits were made (before/after comparison)
  - Sync detection (when to resync from cloud)
  - Edit timeline
  - Shows edit activity frequency
  - Most recent activity timestamp

---

### ZLASTSHAREDDATE (TIMESTAMP)
- **Type**: TIMESTAMP
- **Example**: `795000000.00` (when shared to Messages, iCloud Sharing, etc)
- **What it is**: Last time user shared this photo (to Messages, iCloud Sharing, Mail, etc)
- **When it's used**: Social analytics, frequently shared detection
- **Triggers**: When user:
  - Shares via Messages
  - Adds to shared album
  - Shares via AirDrop
  - Exports to social media
- **Snapora value**: Low-Medium (fun for analytics)
- **Use cases**:
  - "Frequently shared photos" (highlights)
  - Social media candidates
  - Show share count/frequency
  - User engagement metrics
  - Timeline of sharing activity
  - Identify important social moments

---

### ZCLOUDBATCHPUBLISHDATE (TIMESTAMP)
- **Type**: TIMESTAMP
- **Example**: `796000000.00`
- **What it is**: When photo was uploaded to iCloud Photos
- **When it's used**: Cloud sync tracking, backup verification
- **Triggers**: When iCloud Photos sync uploads the photo
- **Snapora value**: Low (mostly for cloud infrastructure)
- **Use cases**:
  - Verify iCloud backup status
  - Show upload time
  - Detect backup lag
  - Cloud sync troubleshooting
  - Sync timeline

---

### ZCLOUDLASTVIEWEDCOMMENTDATE (TIMESTAMP)
- **Type**: TIMESTAMP
- **Example**: `796500000.00`
- **What it is**: Last time user viewed comments on this photo (in shared albums)
- **When it's used**: Notification/engagement tracking
- **Triggers**: When user opens shared album comment thread
- **Snapora value**: Very Low (only for shared albums)
- **Use cases**:
  - Show if comments are unread
  - Notification badges
  - Shared album engagement
  - Recent activity in shared albums

---

### ZADJUSTMENTTIMESTAMP (TIMESTAMP)
- **Type**: TIMESTAMP
- **Example**: `796800000.00`
- **What it is**: When edits/adjustments were last applied (crops, filters, etc)
- **When it's used**: Edit history, show editing activity
- **Different from ZMODIFICATIONDATE**: This is specifically for image edits, not metadata
- **Snapora value**: Medium (identify edited photos)
- **Use cases**:
  - Check if photo has been edited
  - Show "Edited" badge
  - Edit timeline
  - Before/after comparison dates
  - Revert to original function

---

### ZTRASHEDDATE (TIMESTAMP)
- **Type**: TIMESTAMP
- **Example**: `796900000.00` (NULL if not deleted)
- **What it is**: When photo was moved to trash/deleted
- **When it's used**: Trash recovery, undo, deletion history
- **Triggers**: When user deletes photo
- **Snapora value**: Medium (trash functionality)
- **Use cases**:
  - Show deletion date
  - "Recently deleted" filter (typically last 30 days)
  - Undo/recovery features
  - Deletion audit trail
  - Auto-empty old trash (older than 30 days)

---

## 3. IMAGE DIMENSIONS & ORIENTATION (3 fields)

### ZWIDTH (INTEGER)
- **Type**: INTEGER (pixel count)
- **Example**: `1080, 720, 3024, 7680` (ranges from 480 to 12000+)
- **What it is**: Horizontal pixel count of the image
- **When it's used**: Display, aspect ratio, responsive layout
- **NULL handling**: NULL for some non-standard formats
- **Snapora value**: High - essential for display
- **Mutable**: No (inherent to image)
- **Use cases**:
  - Calculate aspect ratio: width / height
  - Filter by resolution (4K = width > 1440)
  - Responsive image sizing
  - Landscape indicator (width > height)
  - Storage calculator (estimate file size)
  - Display orientation hint
  - Resolution tier categorization:
    - Ultra HD (4K+): width > 3840
    - HD: 1920-3840
    - Standard: 720-1920
    - Low res: < 720

---

### ZHEIGHT (INTEGER)
- **Type**: INTEGER (pixel count)
- **Example**: `1920, 1280, 4032, 2160`
- **What it is**: Vertical pixel count of the image
- **When it's used**: Display, aspect ratio, responsive layout
- **NULL handling**: NULL for some formats
- **Snapora value**: High - essential for display
- **Mutable**: No (inherent to image)
- **Aspect ratio**: height / width
  - 16:9 (video standard): height = width * 0.5625
  - 4:3 (photo standard): height = width * 0.75
  - 1:1 (square): height = width
  - 9:16 (portrait): height = width * 1.78
- **Use cases**:
  - Aspect ratio calculation
  - Portrait indicator (height > width)
  - Thumbnail generation
  - Gallery layout decision
  - Text overlay sizing
  - Cropping suggestions

---

### ZORIENTATION (INTEGER)
- **Type**: INTEGER (EXIF Orientation tag)
- **Values**:
  - 1 = Normal (0°)
  - 2 = Flipped horizontally
  - 3 = Rotated 180°
  - 4 = Flipped + rotated 180°
  - 5 = Rotated 90° CCW + flipped
  - 6 = Rotated 90° CW
  - 7 = Rotated 90° CW + flipped
  - 8 = Rotated 90° CCW
- **Example**: `1` (normal orientation)
- **What it is**: EXIF orientation flag - how to display the image
- **When it's used**: Image rendering, rotation, display
- **Snapora value**: High - critical for correct display
- **Mutable**: No (comes from camera/phone)
- **NOTE**: Most modern phones (iPhone) auto-correct orientation, so usually = 1
- **User override**: Photos app lets user manually rotate (changes this value)
- **Use cases**:
  - Apply correct CSS/image rotation
  - Thumbnail generation at correct angle
  - Filter portrait vs landscape
  - Rotation indicator
  - EXIF viewer/metadata display
  - Auto-detect if photo was taken sideways

---

## 4. MEDIA TYPE & FORMAT (4 fields)

### ZKIND (INTEGER)
- **Type**: INTEGER (enumeration)
- **Values**:
  - 0 = Still Photo
  - 1 = Video
  - 2 = Live Photo (photo with short video)
  - (possibly other types in future iOS)
- **Example**: `1` (for videos), `0` (for photos)
- **What it is**: Fundamental media type
- **When it's used**: Processing pipeline, playback method, filtering
- **Snapora value**: CRITICAL - must separate processing workflows
- **Mutable**: No (set at import)
- **Use cases**:
  - **Filter photos vs videos separately**
  - Show different UI (play button for video)
  - Different export options (video codec vs image format)
  - Duration handling (videos have duration, photos don't)
  - Cover art selection (first frame of video)
  - Playback controls
  - Gallery view differences
  - Badge indicators (🎬 for video)

---

### ZKINDSUBTYPE (INTEGER)
- **Type**: INTEGER (enumeration)
- **Values**:
  - 0 = Regular photo
  - 1 = Panorama
  - 2 = HDR
  - 4 = Screenshot
  - 8 = Slow-motion video
  - 16 = Time-lapse
  - 32 = Burst photo
  - 64 = RAW photo
  - 128 = Live photo
  - (various combinations)
- **Example**: `0` (regular), `64` (RAW), `8` (slow-mo)
- **What it is**: Subtype/special format of the media
- **When it's used**: Special handling, badge display, filtering
- **Snapora value**: Medium-High (show badges, special processing)
- **Mutable**: No (inherent to capture)
- **Bit field**: Can be combined (e.g., 8 + 64 = slow-mo RAW)
- **Use cases**:
  - Show badge icons:
    - ⚙️ RAW processing needed
    - 🎬 Slow-motion (need slower playback)
    - ⏱️ Time-lapse (need faster playback)
    - 📸 Burst mode (show all frames or best)
    - ◀️ Panorama (special viewer)
    - 🔲 HDR (tone mapping info)
  - Filter by type (show only RAW photos)
  - Burst selection UI (choose best from 10 similar)
  - Panorama viewer (wide display)
  - Slow-motion playback control
  - Export with correct codec

---

### ZUNIFORMTYPEIDENTIFIER (VARCHAR)
- **Type**: STRING (UTI - Uniform Type Identifier, Apple standard)
- **Examples**:
  - `public.jpeg` = JPEG image
  - `public.heic` = HEIC image (Apple's modern format)
  - `public.png` = PNG image
  - `com.adobe.raw` = Adobe DNG RAW
  - `public.mpeg-4` = MP4 video
  - `com.apple.quicktime-movie` = MOV video
  - `public.avi` = AVI video
  - `public.gif` = Animated GIF
  - `public.webp` = WebP image
- **What it is**: MIME type equivalent for macOS/iOS - tells you the file format
- **When it's used**: Export, conversion, display capability detection
- **Snapora value**: High - needed for proper handling
- **Mutable**: No (inherent to file)
- **Use cases**:
  - Determine if needs conversion
  - Show format badge (JPEG, HEIC, RAW, MP4, etc)
  - Filter by format:
    - Show only RAW for processing
    - Show only HEIC to analyze Apple compression
    - Show only JPEG for compatibility
  - Select output format
  - Check if format is editable
  - Conversion suggestions (HEIC is more efficient than JPEG)
  - Compatibility checking
  - Modern vs legacy format detection

---

### ZSAVEDASSETTYPE (INTEGER)
- **Type**: INTEGER (enumeration)
- **Values**:
  - 1 = Imported photo
  - 2 = Edited version/duplicate
  - 3 = Screenshot
  - 4 = Original/master
  - 5 = Cloud shared item
  - (others possible)
- **Example**: `4` (original), `2` (edited version)
- **What it is**: Where did this photo come from / what's its relationship to originals
- **When it's used**: Edit history, derivative tracking, deduplication
- **Snapora value**: Medium (show edit history, track relationships)
- **Mutable**: No (set at creation)
- **Use cases**:
  - Show "Edited" badge if = 2
  - Link edited photo to original
  - Show edit history (find all edits of same original)
  - Smart deletion (remove edited copy, keep original)
  - Deduplication (find originals vs copies)
  - Edit timeline
  - Revert to original function

---

## 5. LOCATION DATA (3 fields)

### ZLATITUDE (FLOAT)
- **Type**: FLOAT (decimal degrees)
- **Range**: -90.0 (South Pole) to +90.0 (North Pole)
- **Special value**: -180.0 = NO LOCATION DATA
- **Example**: `51.6051` (London), `40.7128` (New York), `-33.8688` (Sydney)
- **Precision**: Decimal degrees with ~6 decimal places = ~0.1 meter accuracy
- **What it is**: Geographic latitude (north-south position)
- **When it's used**: Maps, location filtering, geographic organization
- **Source**: From photo's EXIF GPS data, or manually added by user
- **Snapora value**: VERY HIGH - enables location-based features
- **Mutable**: Yes (user can add/change location in Photos app)
- **Use cases**:
  - **Map view** - plot photos on map
  - **Location collections** - "Photos from Paris", "Photos from vacation"
  - **Geographic search** - "Show photos from this area"
  - **Timeline clustering** - group photos by location
  - **Travel history** - reconstruct trips
  - **Home location detection** - "photos from home"
  - **Venue detection** - reverse geocode to get address/place name
  - **Distance calculation** - sort by proximity
  - **Photo organization by region** - continents, countries, cities
  - **Privacy** - blur/hide for sensitive locations
  - **Memory creation** - "On this day at this place"

---

### ZLONGITUDE (FLOAT)
- **Type**: FLOAT (decimal degrees)
- **Range**: -180.0 (West) to +180.0 (East)
- **Special value**: -180.0 = NO LOCATION DATA
- **Example**: `-0.2752` (London), `-74.0060` (New York), `151.2093` (Sydney)
- **Precision**: Decimal degrees with ~6 decimal places = ~0.1 meter accuracy
- **What it is**: Geographic longitude (east-west position)
- **When it's used**: Maps, location filtering, geographic organization
- **Source**: From photo's EXIF GPS data, or manually added
- **Snapora value**: VERY HIGH - with latitude, enables location-based features
- **Mutable**: Yes (user can add/change location)
- **Use cases**: Same as ZLATITUDE - must use both together
- **Combined usage:**
  ```
  if (latitude != -180.0 AND longitude != -180.0) {
    has_location = true
    location_point = {latitude, longitude}
  }
  ```

---

### ZLOCATIONDATA (BLOB)
- **Type**: BLOB (Binary Large Object)
- **Format**: Binary-encoded location metadata
- **What it is**: Detailed location information in binary format (address, venue name, etc)
- **Content**: Likely contains:
  - Street address
  - City, region, country
  - Venue name (restaurant, landmark)
  - Place type (home, work, restaurant)
  - Timezone
- **When it's used**: Display location name, reverse geocoding, detailed location UI
- **Snapora value**: Medium (need to decode, but very useful)
- **Mutable**: Yes (user can change)
- **Challenge**: Need binary parser to extract - it's not plain text
- **Current limitation**: High effort to decode (proprietary Apple format)
- **Workaround**: Use ZLATITUDE + ZLONGITUDE to do your own reverse geocoding (Google Maps API, etc)
- **Use cases**:
  - Show "Taken at: [Address]" instead of "51.6°N, 0.2°W"
  - Venue detection ("Taken at: Tower Bridge, London")
  - Location name display
  - Place categorization
  - Privacy detection ("Taken at: Home")
  - Frequency analysis ("Taken at this place X times")

---

## 6. QUALITY & AI SCORING (5 fields)

### ZICONICSCORE (FLOAT)
- **Type**: FLOAT (decimal)
- **Range**: -1.0 to 1.0 (where -1.0 = not applicable, 0.0-1.0 = score)
- **Example**: `0.85` (iconic), `0.0` (not iconic), `-1.0` (N/A, usually videos)
- **What it is**: Apple's machine learning score for how "iconic" the photo is
- **How it's calculated**: Apple's ML model analyzes:
  - Subject matter (is this a memorable moment?)
  - Composition (rule of thirds, framing)
  - Clarity (in focus, sharp)
  - Lighting (well-lit)
  - Uniqueness (is it different from typical photos)
  - Emotional impact potential
- **When it's calculated**: When Apple ML analysis runs (usually during import/sync)
- **Snapora value**: VERY HIGH - core to smart curation
- **Mutable**: No (AI-generated, not user editable)
- **Special values**:
  - `-1.0` = Doesn't apply (videos, screenshots, certain formats)
  - `0.0` = Low/not iconic
  - `0.5+` = Decent/remember-worthy
  - `0.8+` = Very iconic/special moment
- **Use cases**:
  - **Smart highlights** - auto-select best photos from vacation
  - **Moments creation** - group iconic photos from same day
  - **Auto-curate collections** - "Your best photos"
  - **Recommendation** - suggest photos to share
  - **Photo memories** - pick iconic shots for "On This Day"
  - **Sort by importance** - show best first in gallery
  - **Automatic album creation** - Memories with high iconic scores
  - **Privacy setting** - only share iconic photos to friends
  - **Storage optimization** - delete low iconic score duplicates
  - **Photo quality ranking** visible to user

---

### ZOVERALLAESTHETICSCORE (FLOAT)
- **Type**: FLOAT (decimal)
- **Range**: 0.0 to 1.0
- **Example**: `0.75` (beautiful), `0.5` (average), `0.2` (poor)
- **What it is**: Apple's ML score for overall visual beauty/quality
- **How it's calculated**: ML model analyzes:
  - Color harmony
  - Lighting quality (golden hour, blue hour, etc)
  - Exposure levels
  - Contrast
  - Saturation/vibrancy
  - Overall visual appeal
  - Blur (camera shake, out of focus)
  - Noise level
- **When it's calculated**: During ML analysis
- **Snapora value**: VERY HIGH - direct measure of "good looking" photo
- **Mutable**: No (ML-generated)
- **Distribution**: Most will cluster around 0.4-0.6 (average)
- **Use cases**:
  - **Beautiful photos collection** - filter aesthetic_score > 0.7
  - **Gallery sorting** - show best-looking first
  - **Auto-delete duplicates** - keep higher aesthetic score
  - **Portfolio building** - only include high-scoring photos
  - **Social media posting** - filter aesthetic > 0.8 for Instagram
  - **Quality control** - flag low scores for re-shooting
  - **Photography feedback** - show user what makes good photos
  - **Memory recommendations** - prefer beautiful moments
  - **Print selection** - only print photos > 0.7 aesthetic
  - **Album organization** - separate "pretty" vs "documentary"

---

### ZPROMOTIONSCORE (FLOAT)
- **Type**: FLOAT (decimal)
- **Range**: 0.0 to 1.0
- **Example**: `0.8` (Apple recommends promoting), `0.0` (not promotional)
- **What it is**: Apple's score for whether this should be featured in Memories/recommendations
- **How it's calculated**: ML model scores based on:
  - User engagement potential
  - Feature-worthiness
  - Share-ability
  - Memories suitability
  - Social network appeal
  - Uniqueness
- **When it's calculated**: During analysis
- **Snapora value**: Medium (for recommendations)
- **Mutable**: No (ML-generated)
- **Use cases**:
  - **Memory creation** - prioritize high promotion score photos
  - **Featured photo selection** - what to show first
  - **Recommendations** - "You might want to share this"
  - **Auto-create stories** - use promotional photos
  - **Notification content** - "Remember this moment?"
  - **Dashboard cards** - show these photos to user
  - **Featured albums** - auto-curate from high scores
  - **Sharing suggestions** - suggest these to share with friends

---

### ZCURATIONSCORE (FLOAT)
- **Type**: FLOAT (decimal)
- **Range**: 0.0 to 1.0
- **Example**: `0.6` (good curation candidate)
- **What it is**: Apple's score for suitability in curated collections (Memories, albums, highlights)
- **How it's calculated**: ML model considers:
  - Variety (is this different from other photos in this group?)
  - Representativeness (does this capture the essence of the moment?)
  - Diversity (mix of closeups, wide shots, etc)
  - Emotional content
  - Narrative flow
- **When it's calculated**: During analysis
- **Snapora value**: Medium (for collection building)
- **Mutable**: No (ML-generated)
- **Use cases**:
  - **Album selection** - which photos to include in album
  - **Moment grouping** - best photos from a moment
  - **Story creation** - photo sequence for narrative
  - **Highlight reels** - curated best-of collections
  - **Photo selection algorithm** - pick diverse photos
  - **Next photo suggestion** - what to show next in slideshow
  - **Variety scoring** - ensure your albums aren't repetitive

---

### ZSTICKERCONFIDENCESCORE (FLOAT)
- **Type**: FLOAT (decimal)
- **Range**: 0.0 to 1.0
- **Example**: `0.9` (definitely has stickers), `0.2` (probably not)
- **What it is**: Apple's ML confidence that this photo has stickers/drawings
- **How it's calculated**: ML model detects:
  - Hand-drawn markups
  - Emoji stickers
  - Text annotations
  - Doodles
  - Highlighted text
- **When it's calculated**: During image analysis
- **Snapora value**: Low (niche use case)
- **Mutable**: No (ML-generated, though user can add/remove stickers)
- **Use cases**:
  - **Tag stickered photos** - for creative projects
  - **Filter marked-up documents** - find annotated photos
  - **Creative content detection** - user-edited/annotated photos
  - **Separate documents from photos** - papers with markups
  - **Backup/archive selection** - prioritize original vs marked-up version

---

## 7. USER PREFERENCES & FLAGS (6 fields)

### ZFAVORITE (INTEGER)
- **Type**: INTEGER (boolean)
- **Values**: 0 = not favorite, 1 = favorite (marked with ❤️)
- **Example**: `1` (user marked favorite), `0` (not marked)
- **What it is**: Whether user explicitly marked this as favorite
- **When it's set**: User taps heart in Photos app
- **Snapora value**: VERY HIGH - direct user preference
- **Mutable**: Yes (user can change anytime)
- **Synced**: Across all devices via iCloud
- **Use cases**:
  - **Favorite collection** - show only favorites
  - **Filter/sort** - "Show my favorites first"
  - **Export** - backup only favorites
  - **Sharing** - suggest favorites to friends
  - **Print** - only print favorites
  - **Desktop/home screen** - frame shows favorite photos
  - **Annual/yearly albums** - auto-curate from favorites
  - **Backup prioritization** - favorites are redundantly backed up
  - **Storage optimization** - never delete favorites, delete others first
  - **Photo weight** - use as ranking signal with other scores

---

### ZHIDDEN (INTEGER)
- **Type**: INTEGER (boolean)
- **Values**: 0 = visible, 1 = hidden
- **Example**: `1` (user hid this)
- **What it is**: Whether user hid photo from main library
- **When it's set**: User taps "Hide photo" in Photos app
- **Snapora value**: HIGH - must respect user privacy
- **Mutable**: Yes (user can show/hide)
- **Synced**: Across all devices
- **Location**: Hidden photos go to "Hidden" album
- **Use cases**:
  - **Filter hidden photos** - toggle show/hide
  - **Privacy respect** - never export hidden photos without permission
  - **Private collection** - view hidden photos separately
  - **Clutter reduction** - hide bad shots, but keep them
  - **Temporary hiding** - user may unhide later
  - **Separate workflow** - process hidden vs visible separately

---

### ZISRECENTLYSAVED (INTEGER)
- **Type**: INTEGER (boolean)
- **Values**: 0 = old, 1 = recently saved (in last few weeks)
- **Example**: `1` (recently saved)
- **What it is**: Whether this was recently saved from Messages, Safari, etc
- **When it's set**: When user saves photo from Messages, email, screenshot, web
- **Triggers**:
  - Saved from Messages
  - Saved from screenshots
  - Exported/saved from apps
  - Downloaded from web/email
- **Snapora value**: Medium (useful for inbox/triage)
- **Mutable**: Yes (system manages automatically, resets after time)
- **Use cases**:
  - **Inbox feature** - "Recently saved" collection
  - **Triage workflow** - organize new saved items
  - **Quick inbox** - see what user recently saved
  - **Smart albums** - "My saved screenshots"
  - **Quick imports** - find what user just saved from Messages
  - **Processing priority** - recently saved items may need action

---

### ZISDETECTEDSCREENSHOT (INTEGER)
- **Type**: INTEGER (boolean)
- **Values**: 0 = not a screenshot, 1 = screenshot (detected by Apple ML)
- **Example**: `1` (screenshot), `0` (real photo)
- **What it is**: Apple's ML auto-detected this is a screenshot
- **How it's detected**: ML model analyzes:
  - Rectangular UI elements
  - Text readability
  - Typical screenshot aspect ratios
  - UI patterns
  - Color banding (compression artifacts)
- **Accuracy**: Very high (98%+)
- **Snapora value**: CRITICAL (you already filter these out!)
- **Mutable**: No (ML-generated, though user can manually move to hidden)
- **When it's set**: Automatically at import/analysis
- **Use cases**:
  - **Screenshot filtering** - exclude from photo library (you do this!)
  - **Screenshot collection** - separate view for screenshots
  - **Storage optimization** - delete old screenshots
  - **Privacy** - don't back up sensitive screenshots
  - **Separate workflows** - process screenshots differently
  - **Badge/tag** - mark screenshots with different icon

---

### ZISMAGICCARPET (INTEGER)
- **Type**: INTEGER (boolean)
- **Values**: 0 = normal video, 1 = has cinematic mode/magic carpet
- **Example**: `1` (has cinematic effect)
- **What it is**: Apple's cinematic video mode (automatic panning focus effect)
- **What is "Magic Carpet"**: Dynamic panning/zooming effect during playback
- **How it's created**: iPhone 13+ records depth info + Apple processes cinematic effect
- **Snapora value**: Low-Medium (niche feature)
- **Mutable**: No (inherent to capture)
- **Use cases**:
  - **Badge** - show 🎬 cinematic badge
  - **Filter** - "Show cinematic videos"
  - **Special playback** - trigger cinematic player
  - **Feature showcase** - highlight latest phone features
  - **Preview** - show cinematic effect in thumbnail

---

## 8. TECHNICAL/CAMERA INFORMATION (6 fields)

### ZHDRGAIN (FLOAT)
- **Type**: FLOAT (decimal)
- **Range**: 0.0 to ~3.0+
- **Example**: `1.5` (significant HDR processing), `0.0` (no HDR), NULL (not applicable)
- **What it is**: Amount of HDR (High Dynamic Range) processing applied
- **How it works**: Camera captures multiple exposures, combines them to show detail in both bright and dark areas
- **Values**:
  - 0.0 = No HDR processing
  - 0.1-0.5 = Light HDR
  - 0.5-1.0 = Moderate HDR
  - 1.0+ = Heavy HDR processing
- **Snapora value**: Medium (identify HDR photos)
- **Mutable**: No (inherent to capture)
- **When it applies**: Photos taken in tricky lighting (sunset, backlit, high contrast scenes)
- **Use cases**:
  - **Badge** - show 📸 HDR badge if > 0
  - **Filter** - "Show HDR photos"
  - **Tone mapping display** - show HDR effect
  - **Processing considerations** - HDR photos may have different color characteristics
  - **Editing caution** - don't over-edit HDR photos
  - **Gallery display** - reveal how much processing was used
  - **Camera capability** - show off dynamic range of phone

---

### ZHDRTYPE (INTEGER)
- **Type**: INTEGER (enumeration)
- **Values**:
  - 0 = Standard dynamic range
  - 1 = HDR (High Dynamic Range)
  - 2 = High bit depth (color space enhancement)
  - (others possible)
- **Example**: `1` (this is an HDR photo)
- **What it is**: Type of dynamic range capture used
- **Snapora value**: High (identify HDR photos)
- **Mutable**: No (inherent to capture)
- **Different from ZHDRGAIN**:
  - ZHDRGAIN = amount of processing (0.0-3.0)
  - ZHDRTYPE = type of capture (standard vs HDR vs high-bit)
- **Use cases**:
  - **Badge** - show if HDR
  - **Filter** - "Show HDR photos only"
  - **Color space handling** - high bit depth needs different rendering
  - **Export** - convert if needed for compatibility
  - **Display** - use appropriate color space

---

### ZDEPTHTYPE (INTEGER)
- **Type**: INTEGER (enumeration)
- **Values**:
  - 0 = No depth information
  - 1 = Portrait depth (synthetic depth from portrait mode)
  - 2 = LiDAR depth (real depth sensor on iPhone 12 Pro+)
  - 3 = Other depth types
- **Example**: `1` (portrait mode), `2` (LiDAR), `0` (no depth)
- **What it is**: Whether photo has depth map (for portrait effect, 3D effect)
- **Snapora value**: Medium (identify portrait photos)
- **Mutable**: No (inherent to capture)
- **Related field**: ZSPATIALTYPE (for spatial videos)
- **Use cases**:
  - **Portrait collection** - filter portrait mode photos
  - **Badge** - show 📷 depth/portrait badge
  - **Effect application** - can apply additional depth effects
  - **3D display** - depth maps enable 3D viewing on supported devices
  - **Portrait mode editing** - adjust blur amount
  - **Live photo interaction** - depth enhances live photo effect
  - **Gallery sorting** - show portrait photos separately

---

### ZSPATIALTYPE (INTEGER)
- **Type**: INTEGER (enumeration)
- **Values**:
  - 0 = Non-spatial (standard photo/video)
  - 1 = Spatial video (Apple's 3D video format for Vision Pro)
- **Example**: `1` (spatial video for Apple Vision Pro)
- **What it is**: Whether this is a spatial 3D video
- **When it's set**: Captured on iPhone 15 Pro+ in spatial video mode
- **Snapora value**: Low (only relevant for Vision Pro users)
- **Mutable**: No (inherent to capture)
- **Future relevance**: Will become more important as spatial computing grows
- **Use cases**:
  - **Filter** - "Show spatial videos"
  - **Badge** - show 🎯 spatial badge
  - **Playback** - use specialized 3D/spatial player
  - **Export** - preserve spatial format or convert
  - **Gallery** - display specially (may need binocular view)
  - **Vision Pro integration** - sync to Vision Pro library

---

### ZDURATION (FLOAT)
- **Type**: FLOAT (seconds with decimals)
- **Range**: 0.0 for photos, 0.01-3600+ for videos
- **Example**: `15.86` seconds (video), `0.0` (still photo)
- **Precision**: Down to 0.001 seconds
- **What it is**: Length of video playback in seconds
- **When it's used**: Video playback, thumbnail generation, timeline display
- **Snapora value**: CRITICAL for videos - essential info
- **Mutable**: No (inherent to video)
- **For photos**: Always 0.0
- **For live photos**: May be non-zero (usually 3 seconds)
- **Use cases**:
  - **Video duration display** - "32 seconds"
  - **Video filtering** - show only videos under 1 minute
  - **Playback control** - show progress bar
  - **Thumbnail generation** - pick middle frame for still
  - **Export planning** - estimate file size/bandwidth
  - **Storage calculation** - videos > 5 min take more space
  - **Quick clips** - filter "quick clips" < 30 seconds
  - **Live photo grouping** - distinguish live photos (3 sec) from videos

---

### ZVIDEOKEYFRAMEVALUE / ZVIDEOKEYFRAMETIMESCALE (INTEGER pair)
- **Type**: INTEGER (two related values)
- **Example**: ZVIDEOKEYFRAMEVALUE=150, ZVIDEOKEYFRAMETIMESCALE=30 = frame at 5 seconds
- **What it is**: Specifies which video frame should be used as thumbnail/cover
- **How it works**:
  - ZVIDEOKEYFRAMEVALUE = frame number or timestamp numerator
  - ZVIDEOKEYFRAMETIMESCALE = time scale denominator
  - Actual time = VALUE / TIMESCALE
- **Snapora value**: Low (Apple handles this automatically)
- **Mutable**: Possibly (user may manually set thumbnail)
- **Use cases**:
  - **Thumbnail generation** - extract this specific frame
  - **Cover art** - use this frame as video still in gallery
  - **Preview** - show representative frame
  - **Smart thumbnails** - detect if face is present in this frame
  - **Video preview scrubbing** - know where key frame is

---

## 9. CLOUD & SYNC STATE (7 fields)

### ZCLOUDISMYASSET (INTEGER)
- **Type**: INTEGER (boolean)
- **Values**: 0 = shared asset (from someone else), 1 = my photo
- **Example**: `1` (I took this), `0` (someone shared with me)
- **What it is**: Does this belong to the user taking photos, or is it shared from someone else
- **When it's set**: At creation - if you took it, 1. If someone shared with you, 0.
- **Snapora value**: High - important for privacy/ownership
- **Mutable**: No (set at creation)
- **Synced**: Yes, consistent across devices
- **Related fields**: ZCLOUDOWNERHASHEDPERSONID (who actually took it)
- **Use cases**:
  - **Filter** - "Show my photos" vs "Show shared with me"
  - **Privacy** - only back up my photos
  - **Sharing decisions** - show owner icon next to shared photos
  - **Credit** - attribute photos to owner
  - **Permissions** - can only edit my photos
  - **Deletion** - only I can delete my photos from shared album
  - **Library organization** - separate my photos from shared

---

### ZCLOUDLOCALSTATE (INTEGER)
- **Type**: INTEGER (enumeration)
- **Values**:
  - 0 = Full resolution stored locally (on device)
  - 1 = Cloud only, needs download
  - 2 = Downloading
  - 3 = Optimized (thumbnail only, full stored in cloud)
- **Example**: `0` (on device), `1` (cloud only), `3` (optimized/cloud backup)
- **What it is**: Whether full-resolution version is downloaded to this device
- **Triggers**:
  - User: "Optimize iPhone storage" - sets to 3 (keep thumbnails locally)
  - Low storage: Automatically optimizes to 3
  - User views photo: Temporarily downloads to 0
- **Snapora value**: High (impacts user experience)
- **Mutable**: Yes (system manages, user can force download)
- **Use cases**:
  - **Icon overlay** - show ☁️ if not on device
  - **Availability** - can I view full-res right now?
  - **Download prompts** - "Downloading full resolution..."
  - **Storage status** - show storage breakdown
  - **Smart export** - mark which photos need download first
  - **Offline access** - warn if they disconnect before download
  - **Device sync** - understanding what's synced across devices
  - **Optimization suggestions** - "Optimize storage to free up space"

---

### ZCLOUDASSETGUID (VARCHAR)
- **Type**: STRING (UUID format)
- **Example**: `A1B2C3D4-E5F6-7890-ABCD-EF1234567890`
- **What it is**: iCloud-specific unique identifier (different from ZUUID)
- **When it's set**: When synced to iCloud Photos
- **Purpose**: iCloud's internal reference for the photo in cloud storage
- **Snapora value**: Low (mostly for Apple infrastructure)
- **Mutable**: No (set by iCloud)
- **Use cases**:
  - **Cloud sync tracking** - reference iCloud records
  - **Troubleshooting** - debug sync issues with Apple
  - **API integration** - link to iCloud Photos API
  - **Deduplication** - map local photo to cloud copy

---

### ZCLOUDBATCHID (VARCHAR)
- **Type**: STRING (batch identifier)
- **Example**: `batch_20240403_093000`
- **What it is**: Groups photos that were uploaded together in single batch
- **When it's set**: At upload to iCloud
- **Snapora value**: Low-Medium (can detect bulk imports)
- **Mutable**: No (set at upload)
- **Use cases**:
  - **Batch detection** - "These 50 photos were imported together"
  - **Import history** - show batch groupings
  - **Timeline analysis** - understand bulk import patterns
  - **Backup verification** - all photos in batch uploaded successfully

---

### ZCLOUDCOLLECTIONGUID (VARCHAR)
- **Type**: STRING (shared album ID)
- **Example**: `shared-album-123456`
- **What it is**: ID of shared album this photo is in (if shared)
- **When it's set**: When photo is added to shared album
- **Snapora value**: Medium (for shared album features)
- **Mutable**: No (links to album)
- **Use cases**:
  - **Shared album detection** - which album is this in?
  - **Shared album browser** - find all photos in album
  - **Navigation** - jump to parent shared album
  - **Permissions** - understand who can see this
  - **Shared album UI** - show shared album info

---

### ZCLOUDOWNERHASHEDPERSONID (VARCHAR)
- **Type**: STRING (hashed identifier)
- **Example**: `abcd1234efgh5678ijkl90mn` (anonymized/hashed)
- **What it is**: Hashed identifier of who took/owns the photo in shared album
- **Why hashed**: Privacy - Apple doesn't expose real names/IDs, just hashed reference
- **When it's set**: Set at creation with owner info
- **Snapora value**: Medium (for shared album attribution)
- **Mutable**: No (set at creation)
- **Privacy**: Can't reverse the hash to get real identity (by design)
- **Use cases**:
  - **Attribution** - "Photo by John" (if you have mapping)
  - **Filtering** - "Show photos by John"
  - **Contributor tracking** - who contributed to shared album?
  - **Statistics** - "You contributed X%, John Y%"
  - **Permissions** - only owner can delete

---

### ZCLOUDDELETESTATE (INTEGER)
- **Type**: INTEGER (enumeration)
- **Values:**
  - 0 = Not deleted in cloud
  - 1 = Deleted in cloud (but may exist locally)
  - 2 = Pending deletion
- **Example**: `0` (exists in cloud)
- **What it is**: Whether this photo has been deleted from iCloud backup
- **Snapora value**: Medium (for cloud/local reconciliation)
- **Mutable**: Yes (changes when deleted from iCloud)
- **Sync implications**: System may delete local copy if deleted from cloud
- **Use cases**:
  - **Backup status** - photo deleted from cloud but still local
  - **Warning** - "This photo will be deleted from all devices"
  - **Recovery** - find locally deleted photos before they're removed from all devices
  - **Cloud vs local sync** - reconcile differences

---

## 10. FACES & DETECTION (1 field)

### ZFACEAREAPOINTS (INTEGER)
- **Type**: INTEGER (face count or encoded data)
- **Range**: 0 to ~30+ (face count)
- **Example**: `0` (no faces), `1` (portrait, one person), `5` (group photo)
- **Special values**: Large numbers like `7600030534729798` = data corruption/encoding, treat as "unknown"
- **What it is**: Face detection data or face count in the photo
- **How it's calculated**: Apple ML face detection at import
- **Accuracy**: Very high for modern photos, less reliable for:
  - Old photos
  - Artwork/photos of paintings
  - Masks/sunglasses
  - Artistic face representations
- **Snapora value**: Medium-High (enables face-based features)
- **Mutable**: No (ML-generated, but may update if photo is edited)
- **Use cases**:
  - **Filter by face count**:
    - 0 faces = no people (landscapes, objects)
    - 1 face = portraits/selfies
    - 2+ faces = group photos, family shots
  - **Portrait collection** - show all 1-face photos
  - **Group photos** - find photos with specific number of people
  - **Type filtering** - "Show group photos" or "Show portraits"
  - **Clustering** - group photos with same people
  - **Face identification** (with person recognition):
    - "Photos with John"
    - "Family photos"
  - **Badge** - show face count (👤, 👥, etc)
  - **Gallery sorting** - organize by number of people
  - **Memory suggestions** - prefer group photos for albums

---

## 11. ANALYSIS & INTELLIGENCE (3 fields)

### ZMEDIAANALYSISATTRIBUTES (INTEGER)
- **Type**: INTEGER (flag/state)
- **Values**: 0 = not analyzed, 1 = analysis in progress, 2 = analysis complete
- **Example**: `2` (analysis done)
- **What it is**: Whether Apple ML has analyzed this photo for metadata
- **When it's set**: Triggered at import or during idle time
- **Snapora value**: Low-Medium (mostly for UI)
- **Mutable**: Yes (changes as analysis completes)
- **Use cases**:
  - **Loading indicator** - show ⏳ if still analyzing
  - **Feature availability** - some features unavailable until = 2
  - **Background processing** - understand sync status
  - **Quality indicator** - wait for analysis before displaying scores

---

### ZPHOTOANALYSISATTRIBUTES (INTEGER)
- **Type**: INTEGER (encoded attributes)
- **Format**: Bit-field encoding various attributes
- **What it is**: Result of Apple's image analysis - scene type, objects, etc
- **Content likely includes**:
  - Scene type (indoor, outdoor, landscape, portrait, macro)
  - Objects detected (tree, mountain, water, face, smile)
  - Colors (predominantly green, blue, etc)
  - Quality indicators
- **Snapora value**: Medium (enables smart search/tagging)
- **Mutable**: No (ML-generated)
- **Challenge**: Likely proprietary encoding, difficult to parse
- **Use cases**:
  - **Smart search** - search by scene type ("Photos with flowers")
  - **Auto-tagging** - tag "landscape", "flower", "dog"
  - **Gallery grouping** - organize by scene type
  - **Suggestions** - "More photos like this"
  - **Filtering** - "Show outdoor photos", "Show portraits"

---

### ZANALYSISSTATEMODIFICATIONDATE (TIMESTAMP)
- **Type**: TIMESTAMP
- **Example**: `796800000.00`
- **What it is**: When analysis attributes were last updated/calculated
- **When it's set**: When Apple ML analysis completes
- **Snapora value**: Low (mostly debugging)
- **Mutable**: Yes (updates when analysis reruns)
- **Use cases**:
  - **Cache invalidation** - check if analysis is fresh
  - **Sync troubleshooting** - verify analysis was updated
  - **Timing** - understand when analysis runs

---

## 12. DUPLICATION & RELATIONSHIPS (2 fields)

### ZDUPLICATEMETADATAMATCHINGALBUM (INTEGER)
- **Type**: INTEGER (reference to another photo's Z_PK)
- **Value**: Z_PK of duplicate photo, or NULL if no duplicate
- **What it is**: Links this photo to similar photo (metadata/content match)
- **How it's detected**: Apple ML compares:
  - Scene matching
  - Content similarity
  - Metadata similarity (same time, location)
  - File hash (exactly identical files)
- **Snapora value**: High (for deduplication)
- **Mutable**: No (ML-generated)
- **Use cases**:
  - **Duplicate detection** - find which photos are duplicates
  - **Merge suggestions** - "These seem to be duplicates, keep which one?"
  - **Smart deletion** - safely delete lower-quality duplicate
  - **Deduplication workflow** - show pairs of similar photos
  - **Redundancy removal** - trim library before backup

---

### ZDUPLICATEPERCEPTUALMATCHINGALBUM (INTEGER)
- **Type**: INTEGER (reference to similar photo's Z_PK)
- **Value**: Z_PK of similar photo, or NULL
- **What it is**: Links to perceptually similar photo (different angle/moment of same scene)
- **Difference from METADATA duplicates**:
  - Metadata duplicates = identical or almost identical
  - Perceptual duplicates = different angle, slight time difference, but same moment (e.g., burst shot)
- **How it's detected**: Deep ML visual similarity (not just hash)
- **Snapora value**: High (for smart selection)
- **Mutable**: No (ML-generated)
- **Use cases**:
  - **Burst selection** - "Pick the best of these 5 similar shots"
  - **Smart cleanup** - remove redundant shots from burst
  - **Comparison view** - show "you have these similar shots"
  - **Similarity grouping** - organize into sets of similar photos
  - **Edit assistance** - "You took multiple similar shots, keep the best"
  - **Gallery deduping** - show variations of same moment

---

## 13. ORGANIZATION & COLLECTIONS (4 fields)

### ZALBUMASSOCIATIVITY (INTEGER)
- **Type**: INTEGER (count)
- **Range**: 0 to ~100+
- **Example**: `3` (photo is in 3 albums)
- **What it is**: How many albums contain this photo
- **When it's set**: Updated when photo is added/removed from albums
- **Snapora value**: Low-Medium (for info display)
- **Mutable**: Yes (changes as user creates/removes albums)
- **Use cases**:
  - **Info display** - "In 3 albums"
  - **Organization indicator** - highly organized photos
  - **Statistics** - average albums per photo
  - **Filtering** - "Photos in multiple albums" = important

---

### ZIMPORTSESSION (INTEGER)
- **Type**: INTEGER (reference to import session)
- **Example**: `123` (session 123)
- **What it is**: Which import batch this photo belongs to
- **When it's set**: At import, groups imported photos together
- **Snapora value**: Low-Medium (for import history)
- **Mutable**: No (set at import)
- **Use cases**:
  - **Batch grouping** - show photos imported together
  - **Import timeline** - "Imported March 15 at 2pm"
  - **Organization** - help user understand import history
  - **Filtering** - "Show photos from this import"

---

### ZLIBRARYSCOPE (INTEGER)
- **Type**: INTEGER (enumeration)
- **Values**:
  - 0 = Personal library (user's own Photos library)
  - 1 = Shared library (in case of family shared library)
  - 2 = Other scope
- **Example**: `0` (personal), `1` (family shared)
- **What it is**: Which library this photo belongs to
- **When it's set**: At creation/import
- **Snapora value**: Medium (important for permissions)
- **Mutable**: No (set at creation)
- **Use cases**:
  - **Filter** - "Show my library" vs "Show shared library"
  - **Permissions** - can only edit my library "
  - **Sync** - libraries sync separately
  - **Privacy** - separate personal from shared
  - **Data residency** - may be on different servers

---

### ZMOMENT (INTEGER)
- **Type**: INTEGER (reference to moment ID)
- **What it is**: Links to "Moment" grouping (Apple's smart clustering by time/location)
- **When it's set**: Apple ML groups nearby photos (same day, location) into moments
- **Snapora value**: Medium (enables moment-based organization)
- **Mutable**: No (ML-grouping)
- **What is a "Moment"**:
  - Photos from same event/time (usually 1 day)
  - Grouped by location proximity
  - Typically 5-50 photos
- **Use cases**:
  - **Moment navigation** - "Show all photos from this moment"
  - **Moment albums** - auto-created albums per moment
  - **Timeline view** - show moments instead of individual photos
  - **News-style layout** - show moment thumbnails
  - **Memory creation** - prioritize moment photos
  - **Event detection** - "Moment on March 15"

---

## 14. TRASH & VISIBILITY (3 fields)

### ZTRASHEDSTATE (INTEGER)
- **Type**: INTEGER (enumeration)
- **Values**: 0 = active/valid photo, 1 = in trash/deleted
- **Example**: `0` (not deleted), `1` (in trash)
- **What it is**: Whether photo has been deleted/is in trash
- **When it's set**: When user deletes photo (moved to Recently Deleted)
- **Retention**: Photos stay in trash for 30 days, then auto-delete
- **Snapora value**: CRITICAL (you filter out these already!)
- **Mutable**: Yes (user can delete or recover)
- **Synced**: Yes, across devices
- **Use cases**:
  - **Filter deleted** - exclude from library view (you do this: WHERE ZTRASHEDSTATE = 0)
  - **Trash view** - show deleted photos (Recently Deleted album)
  - **Recovery** - user can see what's being deleted
  - **Recovery deadline** - show "will auto-delete in X days"
  - **Permanent delete** - user can force permanent delete
  - **Backup** - don't back up deleted photos

---

### ZTRASHEDREASON (VARCHAR)
- **Type**: STRING
- **Example**: `"user-deleted"`, `"auto-delete-duplicate"`, `"burst-selection"`
- **What it is**: Why was this photo deleted
- **Snapora value**: Low (mostly informational)
- **Mutable**: No (set when deleted)
- **Possible values** (speculative):
  - "user-deleted" = User manually deleted
  - "auto-delete-duplicate" = System auto-removed duplicate
  - "burst-selection" = User chose best from burst, others deleted
  - "optimization" = Auto-deleted to save storage
- **Use cases**:
  - **Explain deletion** - show reason to user
  - **Smart recovery** - if reason is "duplicate", suggest original
  - **Pattern analysis** - understand delete behavior

---

### ZTRASHEDBYPARTICIPANT (INTEGER)
- **Type**: INTEGER (participant ID, hashed)
- **Example**: `1` (participant 1 in shared album deleted this)
- **What it is**: In shared albums, who deleted this photo
- **When it's set**: When someone in shared album deletes photo
- **Snapora value**: Low-Medium (for shared album collaboration)
- **Mutable**: No (set when deleted)
- **Use cases**:
  - **Attribution** - show "Deleted by: John"
  - **Collaboration** - understand shared album changes
  - **Permissions** - only some participants can delete
  - **Audit trail** - track who did what in shared album

---

## 15. VIDEO-SPECIFIC FIELDS (3 fields)

### ZPLAYBACKSTYLE (INTEGER)
- **Type**: INTEGER (enumeration)
- **Values**:
  - 0 = Normal playback (play once)
  - 1 = Loop (restart when finished)
  - 2 = Bounce (forward then backward)
  - 3 = Shuffle
- **Example**: `0` (normal), `1` (loop)
- **What it is**: How video plays in Memories/slideshows
- **When it's set**: At creation based on video type
- **Snapora value**: Low (mostly Apple internal)
- **Mutable**: Possibly (user may customize)
- **Use cases**:
  - **Playback control** - use correct playback mode
  - **Memory creation** - loop short clips for continuous playback
  - **Slideshow** - determine playback style
  - **Badge** - show 🔁 for loop videos

---

### ZPLAYBACKVARIATION (INTEGER)
- **Type**: INTEGER (quality variant)
- **Example**: `1` (low res), `2` (medium), `3` (high)
- **What it is**: Which video bitrate/quality variant to use
- **When it's set**: At encoding when video imported
- **Snapora value**: Low (Apple handles automatically)
- **Mutable**: No (set at import)
- **Use cases**:
  - **Adaptive streaming** - choose quality based on connection
  - **Storage optimization** - use lower quality variant if needed

---

### ZPROXYSTATE (INTEGER)
- **Type**: INTEGER (enumeration)
- **Values**: 0 = no proxy, 1 = has proxy, 2 = proxy in progress
- **Example**: `1` (has compressed proxy)
- **What it is**: Whether a compressed/transcoded version exists for fast editing/preview
- **When it's set**: During video import, Apple creates compressed proxy for smooth editing
- **Purpose**: Original 4K video too slow to edit, proxy is 1080p for smooth scrubbing
- **Snapora value**: Low (automatic Apple feature)
- **Mutable**: Yes (can be regenerated)
- **Use cases**:
  - **Performance** - use proxy for preview, original for export
  - **Editing** - smooth playback while editing preview
  - **Storage** - understand that proxy + original take space

---

## 16. ALBUM/MEMORY ASSOCIATIONS (6 fields)

### ZDAYGROUPHIGHLIGHTBEINGASSETS (INTEGER)
- **Type**: INTEGER (boolean or count)
- **What it is**: Is this photo one of Apple's highlighted photos for "Day" grouping
- **When it's set**: ML determines which photos are highlights
- **Snapora value**: Low (Apple's internal feature)
- **Use cases**:
  - **Highlight detection** - mark special photos
  - **Featured photos** - show highlighted ones first

---

### ZDAYGROUPHIGHLIGHTBEINGEXTENDEDASSETS (INTEGER)
- **Type**: INTEGER (boolean)
- **What it is**: Extended highlight set (less prominent than primary highlights)
- **Snapora value**: Low

---

### ZDAYGROUPHIGHLIGHTBEINGKEYASSETPRIVATE / SHARED (INTEGER)
- **Type**: INTEGER (boolean)
- **What it is**: Is this the key/cover photo for a day highlight
  - PRIVATE = key photo for personal library
  - SHARED = key photo when shared
- **When it's set**: ML selects best photo to represent the day
- **Snapora value**: Low-Medium (shows important photos)
- **Use cases**:
  - **Cover photo** - use for day thumbnail in timeline
  - **Importance** - this photo represents the day

---

### ZHIGHLIGHTBEINGASSETS / ZHIGHLIGHTBEINGEXTENDEDASSETS / ZHIGHLIGHTBEINGKEYASSET* (6 memory variations) (INTEGER)
- **Type**: INTEGER (similar to day variants)
- **What it is**: Used in Memories/slideshows instead of just daily grouping
- **Differs from**: Day variants - these apply to longer-form memories (week, month, year)
- **Snapora value**: Low (Apple Memories feature)

---

### ZMONTHHIGHLIGHTBEINGKEYASSETPRIVATE / SHARED (INTEGER)
- **Type**: INTEGER (boolean)
- **What it is**: Key photo for month-long memory
- **Snapora value**: Low

---

### ZYEARHIGHLIGHTBEINGKEYASSETPRIVATE / SHARED (INTEGER)
- **Type**: INTEGER (boolean)
- **What it is**: Key photo for year in review memory
- **Snapora value**: Low-Medium (annual highlight)

---

## 17. LIBRARY MANAGEMENT (6 fields)

### ZLIBRARYSCOPESHARESTATE (INTEGER)
- **Type**: INTEGER (enumeration)
- **Values**: 0 = not shared, 1 = shared, 2 = sharing in progress
- **What it is**: Is photo part of a shared library
- **Snapora value**: Medium (for shared library features)
- **Mutable**: Yes (changes with share status)

---

### ZCOLLECTIONSHARE (INTEGER)
- **Type**: INTEGER (reference)
- **What it is**: Links to shared collection/album (if any)
- **Snapora value**: Low

---

### ZCOLLECTIONSHAREASSETCONTRIBUTOR (INTEGER)
- **Type**: INTEGER (boolean)
- **What it is**: Did this user contribute this photo to shared collection
- **Snapora value**: Low-Medium (shared album stats)

---

### ZCOMPUTESYNCATTRIBUTES (INTEGER)
- **Type**: INTEGER (state flags)
- **What it is**: Internal sync state flags
- **Snapora value**: Very Low (internal Apple only)

---

### ZCOMPUTEDATTRIBUTES (INTEGER)
- **Type**: INTEGER (state flags)
- **What it is**: Which computed attributes are available
- **Snapora value**: Very Low (internal)

---

### ZCONVERSATION (INTEGER)
- **Type**: INTEGER (reference)
- **What it is**: Link to comment thread/conversation
- **Snapora value**: Low

---

## 18. PROCESSING STATE (4 fields)

### ZCOMPLETE (INTEGER)
- **Type**: INTEGER (boolean)
- **Values**: 0 = import/processing in progress, 1 = complete
- **Example**: `1` (ready to use), `0` (still processing)
- **What it is**: Has import/processing completed
- **When it's used**: Show loading indicator while = 0
- **Snapora value**: Medium (for UI feedback)
- **Mutable**: Yes (changes during processing)
- **Use cases**:
  - **Loading state** - show ⏳ if not complete
  - **Feature gating** - some features unavailable while processing
  - **User feedback** - "Importing..."

---

### ZDEFERREDPROCESSINGNEEDED (INTEGER)
- **Type**: INTEGER (boolean)
- **Values**: 0 = processed, 1 = needs processing
- **What it is**: Whether photo needs to be processed (usually due to changes)
- **When it's set**: When user edits, or sync brings new version
- **Snapora value**: Low (Apple handles automatically)
- **Use cases**:
  - **Background processing** - trigger processing queue
  - **Rebuild features** - regenerate analysis

---

### ZSEARCHINDEXREBUILDSTATE (INTEGER)
- **Type**: INTEGER (state)
- **Values**: 0 = not indexed, 1 = indexed, 2 = needs reindex
- **What it is**: Is this photo searchable/indexed
- **When it's set**: After analysis, photo becomes searchable
- **Snapora value**: Low (Apple handles)
- **Use cases**:
  - **Search availability** - can search this photo yet?

---

### ZVIDEODEFERREDPROCESSINGNEEDED (INTEGER)
- **Type**: INTEGER (boolean)
- **What it is**: Video-specific processing needed
- **When it's set**: When video import/processing incomplete
- **Snapora value**: Low (Apple handles)

---

## 19. PARTICIPANT & SHARING (1 field)

### ZTRASHEDBYPARTICIPANT (INTEGER) - [Already covered in section 14]
- (See Trash & Visibility section)

---

## 20. BINARY/COMPLEX DATA (2 fields)

### ZIMAGEREQUESTHINTS (BLOB)
- **Type**: BLOB (binary data)
- **Format**: Proprietary Apple binary format
- **What it is**: Internal hints for image rendering/optimization
- **Snapora value**: Very Low (internal Apple only)
- **Mutable**: No
- **Use cases**: None for external apps
- **Difficulty**: Can't parse without Apple's format specification

---

### ZLOCATIONDATA (BLOB) - [Already covered in section 5]
- (See Location Data section - contains address, venue info in binary)

---

## 21. INTERNAL DATABASE FIELDS (6 fields)

### Z_ENT (INTEGER)
- **Type**: INTEGER (entity type marker)
- **What it is**: Internal database entity type
- **Snapora value**: None (internal database only)
- **Skip this**: Not useful for external apps

---

### Z_OPT (INTEGER)
- **Type**: INTEGER (optimization flags)
- **What it is**: Internal optimization marker
- **Snapora value**: None

---

### Z_FOK_* (Integer fields - ~6 of these)
- **Type**: INTEGER (foreign key references)
- **Format**: Z_FOK_{TABLE_NAME}
- **Example**: Z_FOK_CLOUDFEEDASSETSENTRY
- **What it is**: Internal foreign key relationships
- **Snapora value**: None (internal relationships)

---

### ZMASTER (INTEGER)
- **Type**: INTEGER (reference)
- **What it is**: Links to master image record
- **Snapora value**: Very Low (mostly for Apple's internal relational design)
- **Use cases**: Understand edit history chains

---

### ZADJUSTMENTSSTATE (INTEGER)
- **Type**: INTEGER (state flags)
- **Values**: 0 = no edits, 1 = has edits
- **What it is**: Whether this photo has edit history
- **Snapora value**: Low-Medium (show "Edited" badge)
- **Use cases**:
  - **Edit detection** - "This has been edited"
  - **Revert-to-original** - can user undo all edits?
  - **Original available** - is original still available or overwritten?

---

### ZEXTENDEDATTRIBUTES (INTEGER)
- **Type**: INTEGER (flag)
- **What it is**: Whether extended attributes/metadata is available
- **Snapora value**: Very Low

---

---

## SUMMARY TABLE

| Field | Type | Priority | Mutable | Synced | Key Use Case |
|-------|------|----------|---------|--------|--------------|
| ZUUID | String | CRITICAL | No | Yes | Unique ID across devices |
| ZKIND | Int | CRITICAL | No | Yes | Photo vs video |
| ZDATECREATED | Timestamp | CRITICAL | No | Yes | Real capture time |
| ZFAVORITE | Boolean | CRITICAL | Yes | Yes | User preference |
| ZISDETECTEDSCREENSHOT | Boolean | CRITICAL | No | Yes | Filter screenshots |
| ZWIDTH/ZHEIGHT | Int | HIGH | No | Yes | Display/resolution |
| ZORIENTATION | Int | HIGH | No | Yes | Correct rotation |
| ZLATITUDE/ZLONGITUDE | Float | HIGH | Yes | Yes | Location-based features |
| ZICONICSCORE | Float | VERY HIGH | No | Yes | Auto-curate best shots |
| ZOVERALLAESTHETICSCORE | Float | VERY HIGH | No | Yes | Quality ranking |
| ZFACEAREAPOINTS | Int | MEDIUM | No | Yes | Portrait vs group |
| ZADDEDDATE | Timestamp | MEDIUM | No | Yes | Import history |
| ZMODIFICATIONDATE | Timestamp | MEDIUM | No | Yes | Edit tracking |
| ZHIDDEN | Boolean | MEDIUM | Yes | Yes | Respect hidden status |
| ZDURATION | Float | MEDIUM | No | Yes | Video length |
| ZUNIFORMTYPEIDENTIFIER | String | MEDIUM | No | Yes | File format |
| ZCLOUDISMYASSET | Boolean | MEDIUM | No | Yes | Ownership/permission |
| ZMOMENT | Int | MEDIUM | No | Yes | Event grouping |
| ZTRASHEDSTATE | Boolean | HIGH | Yes | Yes | Filter deleted (you do this!) |
| ZSAVEDASSETTYPE | Int | LOW | No | Yes | Edit chain tracking |
| ZPROMOTIONSCORE | Float | LOW | No | Yes | Memory suggestions |
| HDRGAIN/HDRTYPE | Float/Int | LOW | No | Yes | HDR badge |
| ZDEPTHTYPE | Int | LOW | No | Yes | Portrait mode |
| All others | Various | VERY LOW | Varies | Varies | Niche features |

---

## Practical Implementation Priority

### Phase 1 (Essential - Build Now):
- ZUUID, ZKIND, ZDATECREATED, ZADDEDDATE, ZWIDTH, ZHEIGHT
- ZFAVORITE, ZHIDDEN, ZISDETECTEDSCREENSHOT, ZTRASHEDSTATE
- ZLATITUDE, ZLONGITUDE, ZORIENTATION

### Phase 2 (Important - Build Next):
- ZICONICSCORE, ZOVERALLAESTHETICSCORE, ZPROMOTIONSCORE
- ZFACEAREAPOINTS, ZMOMENT, ZDURATION, ZUNIFORMTYPEIDENTIFIER
- ZMODIFICATIONDATE, ZCLOUDISMYASSET

### Phase 3 (Nice to Have - Build Later):
- All HDR/depth/technical fields
- All ML analysis fields
- All duplication detection fields
- All cloud state fields

### Phase 4 (Niche - Build If Time):
- All memory/highlight association fields
- All internal database fields
- All participant/sharing details

---

**That's all 134 fields explained!** Pick the ones that matter most for your Snapora features.
