export interface Perencanaan {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePerencanaanData {
  name: string;
  start_date: string;
  end_date: string;
}

export interface UpdatePerencanaanData {
  name?: string;
  start_date?: string;
  end_date?: string;
  status?: "active" | "completed" | "draft";
}

export interface PerencanaanStatistics {
  total: number;
  active: number;
  completed: number;
  draft: number;
  totalValue: number;
}

export interface PerencanaanResponse {
  data: Perencanaan[];
  meta: {
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
    next_page?: number;
    prev_page?: number;
  };
}

export interface Rekening {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  currentBalance: number;
  planningId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRekeningData {
  name: string;
  bankName: string;
  accountNumber: string;
  currentBalance: number;
  planningId: string;
}

export interface RencanaAnggaran {
  id: string;
  name: string;
  planningDate: string;
  generalAmount: number;
  accounts: RencanaAccount[];
  planningId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RencanaAccount {
  id: string;
  accountName: string;
  debit: number;
  credit: number;
  rencanaId: string;
}

export interface CreateRencanaData {
  name: string;
  planningDate: string;
  generalAmount: number;
  accounts: Omit<RencanaAccount, 'id' | 'rencanaId'>[];
  planningId: string;
}

export interface LaporanJurnalUmum {
  id: string;
  date: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
  planningId: string;
}

export interface LaporanLabaRugi {
  id: string;
  accountNumber: string;
  accountName: string;
  budgetPlan: number;
  realizationPlan: number;
  category: "pendapatan" | "beban";
  planningId: string;
}

export interface LaporanNeraca {
  id: string;
  accountNumber: string;
  accountName: string;
  realization: number;
  category: "aktiva" | "pasiva";
  subCategory: string;
  planningId: string;
}

export interface LaporanArusKas {
  id: string;
  categoryName: string;
  amount: number;
  category: "operasi" | "investasi" | "pendanaan";
  planningId: string;
}
