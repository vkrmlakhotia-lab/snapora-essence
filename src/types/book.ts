export interface BookPhoto {
  id: string;
  url: string;
  file?: File;
}

export type PageLayout = '1-up' | '2-up' | '3-up';

export interface BookPage {
  id: string;
  layout: PageLayout;
  photos: BookPhoto[];
  caption?: string;
}

export interface BookProject {
  id: string;
  title: string;
  coverPhoto?: string;
  pages: BookPage[];
  status: 'draft' | 'completed' | 'ordered';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  bookId: string;
  bookTitle: string;
  pageCount: number;
  pricePerPage: number;
  deliveryFee: number;
  total: number;
  status: 'processing' | 'shipped' | 'delivered';
  orderedAt: string;
}
