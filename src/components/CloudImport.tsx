import { Cloud, Smartphone } from 'lucide-react';

interface CloudImportProps {
  onImport: (photos: { id: string; url: string }[]) => void;
}

// Mock cloud photo URLs
const MOCK_CLOUD_PHOTOS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop',
];

const CloudImport = ({ onImport }: CloudImportProps) => {
  const handleImport = (source: string) => {
    // Mock: simulate importing photos from cloud
    const photos = MOCK_CLOUD_PHOTOS.map((url, i) => ({
      id: `${source}-${Math.random().toString(36).substring(2, 10)}`,
      url,
    }));
    onImport(photos);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Import from</p>
      <button
        onClick={() => handleImport('google')}
        className="w-full bg-card rounded-xl p-4 card-shadow flex items-center gap-3 hover:bg-accent transition-colors"
      >
        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">Google Photos</p>
          <p className="text-[11px] text-muted-foreground">Import from your library</p>
        </div>
      </button>

      <button
        onClick={() => handleImport('icloud')}
        className="w-full bg-card rounded-xl p-4 card-shadow flex items-center gap-3 hover:bg-accent transition-colors"
      >
        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
          <Cloud size={18} strokeWidth={1.5} className="text-muted-foreground" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">iCloud Photos</p>
          <p className="text-[11px] text-muted-foreground">Import from iCloud</p>
        </div>
      </button>

      <button
        onClick={() => handleImport('device')}
        className="w-full bg-card rounded-xl p-4 card-shadow flex items-center gap-3 hover:bg-accent transition-colors"
      >
        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
          <Smartphone size={18} strokeWidth={1.5} className="text-muted-foreground" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">Device Gallery</p>
          <p className="text-[11px] text-muted-foreground">Recent photos on this device</p>
        </div>
      </button>
    </div>
  );
};

export default CloudImport;
