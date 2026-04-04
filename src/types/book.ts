export interface BookPhoto {
  id: string;
  url: string;
  file?: File;
  isLowRes?: boolean;
  isDuplicate?: boolean;
}

// Layout types: {count}-{variant}
export type PageLayout =
  // 1 photo
  | 'full-bleed'
  | 'matted'
  | 'left-portrait'
  // 2 photos
  | 'split'
  | 'hero-detail'
  | 'two-verticals'
  // 3 photos
  | 'triptych'
  | 'hero-stack'
  | 'triple-vertical'
  // 4 photos
  | 'grid-2x2'
  | 'hero-triptych'
  // 5 photos
  | 'hero-right-stack'
  | 'two-large-three-wide'
  // 6 photos
  | 'grid-3x2'
  | 'hero-mixed-stack'
  // Mixed orientation
  | 'vert-horiz-pair'
  | 'landscape-top-two-vert';

export type PaperFinish = 'matte' | 'glossy' | 'layflat';

export type BookStyle = 'classic' | 'baby' | 'yearbook' | 'wedding' | 'travel' | 'minimal';

export interface BookPage {
  id: string;
  layout: PageLayout;
  photos: BookPhoto[];
  caption?: string;
  dateLabel?: string;
  mapUrl?: string;
  mapPinLabel?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  photosAdded: number;
  joinedAt: string;
}

export interface BookProject {
  id: string;
  title: string;
  coverPhoto?: string;
  pages: BookPage[];
  status: 'draft' | 'completed' | 'ordered';
  createdAt: string;
  updatedAt: string;
  paperFinish?: PaperFinish;
  style?: BookStyle;
  giftNote?: string;
  collaborators?: Collaborator[];
  shareLink?: string;
  aiPrompt?: string;
}

export interface OrderItem {
  id: string;
  bookId: string;
  bookTitle: string;
  pageCount: number;
  pricePerPage: number;
  deliveryFee: number;
  total: number;
  status: 'processing' | 'printed' | 'shipped' | 'delivered';
  orderedAt: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export const PAPER_FINISHES: { value: PaperFinish; label: string; description: string }[] = [
  { value: 'matte', label: 'Matte', description: 'Soft, non-reflective finish' },
  { value: 'glossy', label: 'Glossy', description: 'Vibrant, high-shine finish' },
  { value: 'layflat', label: 'Lay-Flat', description: 'Pages lie completely flat (+£3)' },
];

export const BOOK_STYLES: { value: BookStyle; label: string; emoji: string }[] = [
  { value: 'classic', label: 'Classic', emoji: '📖' },
  { value: 'baby', label: 'Baby Book', emoji: '👶' },
  { value: 'yearbook', label: 'Year Book', emoji: '📅' },
  { value: 'wedding', label: 'Wedding', emoji: '💍' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'minimal', label: 'Minimal', emoji: '◻️' },
];

export const AI_PROMPTS: { prompt: string; label: string }[] = [
  { prompt: 'Minimalist wedding album with elegant white space', label: 'Elegant Wedding' },
  { prompt: 'Colorful baby milestone book with playful layouts', label: 'Baby Milestones' },
  { prompt: 'Cinematic travel journal with full-bleed photos', label: 'Travel Journal' },
  { prompt: 'Modern yearbook with clean grid layouts', label: 'Year in Review' },
  { prompt: 'Cozy family memories with warm tones', label: 'Family Memories' },
];

/** How many photos a layout expects */
export function layoutPhotoCount(layout: PageLayout): number {
  switch (layout) {
    case 'full-bleed':
    case 'matted':
    case 'left-portrait':
      return 1;
    case 'split':
    case 'hero-detail':
    case 'two-verticals':
      return 2;
    case 'triptych':
    case 'hero-stack':
    case 'triple-vertical':
    case 'vert-horiz-pair':
    case 'landscape-top-two-vert':
      return 3;
    case 'grid-2x2':
    case 'hero-triptych':
      return 4;
    case 'hero-right-stack':
    case 'two-large-three-wide':
      return 5;
    case 'grid-3x2':
    case 'hero-mixed-stack':
      return 6;
  }
}

export interface LayoutOption {
  layout: PageLayout;
  label: string;
  photoCount: number;
}

export const ALL_LAYOUTS: LayoutOption[] = [
  // 1 photo
  { layout: 'full-bleed', label: 'Full Bleed', photoCount: 1 },
  { layout: 'matted', label: 'Matted', photoCount: 1 },
  { layout: 'left-portrait', label: 'Left Portrait', photoCount: 1 },
  // 2 photos
  { layout: 'split', label: 'Split', photoCount: 2 },
  { layout: 'hero-detail', label: 'Hero + Detail', photoCount: 2 },
  { layout: 'two-verticals', label: 'Two Verticals', photoCount: 2 },
  // 3 photos
  { layout: 'triptych', label: 'Triptych', photoCount: 3 },
  { layout: 'hero-stack', label: 'Hero + Stack', photoCount: 3 },
  { layout: 'triple-vertical', label: 'Triple Vertical', photoCount: 3 },
  // 4 photos
  { layout: 'grid-2x2', label: '2×2 Grid', photoCount: 4 },
  { layout: 'hero-triptych', label: 'Hero + Triptych', photoCount: 4 },
  // 5 photos
  { layout: 'hero-right-stack', label: 'Hero + Stack', photoCount: 5 },
  { layout: 'two-large-three-wide', label: '2 + 3 Grid', photoCount: 5 },
  // 6 photos
  { layout: 'grid-3x2', label: '3×2 Grid', photoCount: 6 },
  { layout: 'hero-mixed-stack', label: 'Hero + Mixed', photoCount: 6 },
  // Mixed
  { layout: 'vert-horiz-pair', label: 'Vert + Horiz', photoCount: 3 },
  { layout: 'landscape-top-two-vert', label: 'Top + 2 Vert', photoCount: 3 },
];
