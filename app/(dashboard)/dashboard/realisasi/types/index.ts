export interface AccountItem {
  id: string;
  code: string;
  name: string;
  type: string;
  level: number;
  expanded: boolean;
  children: AccountItem[];
}

export interface AccountTableItem {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
  status: 'active' | 'inactive' | 'pending';
  lastUpdated: string;
  bankNumber?: string;
}

export interface TransactionItem {
  id: string;
  date: string;
  category: string;
  transactionName: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  type: 'debit' | 'credit';
  parentTransactionId: string;
}

export interface ReportItem {
  id: string;
  title: string;
  type: 'financial' | 'operational' | 'compliance';
  status: 'published' | 'draft';
  createdBy: string;
  createdAt: string;
  lastModified: string;
  description: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  debitAccount: string;
  creditAccount: string;
}

export type TabType = "daftar-akun" | "daftar-rekening" | "transaksi" | "laporan" | "kategori";
