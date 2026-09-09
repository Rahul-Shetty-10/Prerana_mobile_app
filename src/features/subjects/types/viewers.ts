export interface ImageViewerProps {
  title: string;
  imageUrl?: string;
  description?: string;
  isMindmap?: boolean;
  authToken?: string;
}

export interface MindmapNode {
  id: string;
  label: string;
  details?: string;
  children?: MindmapNode[];
}

export interface MindmapViewerProps {
  title?: string;
  description?: string;
  rootNode?: MindmapNode;
  authToken?: string;
}

export interface PDFPageItem {
  pageNumber: number;
  title: string;
  textContent: string;
}

export interface PDFViewerProps {
  documentTitle: string;
  pdfUrl?: string;
  totalPages?: number;
  pages?: PDFPageItem[];
  currentPageIndex?: number;
  onPageChange?: (index: number) => void;
  isSlidedeck?: boolean;
  authToken?: string;
}

export interface FlashcardItem {
  id: string;
  frontText: string;
  backText: string;
  category?: string;
}


export interface TableColumn {
  key: string;
  title: string;
  width?: number;
}

export interface TableRowData {
  id: string;
  [key: string]: any;
}

export interface TableViewerProps {
  title: string;
  columns?: TableColumn[];
  rows?: TableRowData[];
}

export interface AudioViewerProps {
  audioTitle: string;
  audioUrl?: string;
  durationSeconds?: number;
  speakerName?: string;
  authToken?: string;
}

export interface VideoViewerProps {
  title?: string;
  videoTitle?: string;
  videoUrl?: string;
  description?: string;
  authToken?: string;
}
