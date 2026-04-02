export interface BookPhoto {
  id: string;
  url: string;
  file?: File;
  isLowRes?: boolean;
  isDuplicate?: boolean;
}

export type PageLayout = '1-up' | '2-up' | '3-up';

export type PaperFinish = 'matte' | 'glossy' | 'layflat';

export type BookStyle = 'classic' | 'baby' | 'yearbook' | 'wedding' | 'travel' | 'minimal';

export interface BookPage {
  id: string;
  layout: PageLayout;
  photos: BookPhoto[];
  caption?: string;
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
