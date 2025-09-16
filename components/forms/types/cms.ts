import { Category } from "@/client/cmsCategoryClient";

export interface CMSItem {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
  description: string;
  content: string;
  is_active: boolean;
  categories?: Category[];
  already_indexed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CMSTableProps {
  data: CMSItem[];
  pageCount: number;
  pageNo: number;
  pageSize: number;
  totalUsers: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onToggleStatus?: (id: number, newStatus: boolean) => Promise<void>;
}

export interface CMSResponse {
  items: CMSItem[];
  meta: {
    total_items: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}