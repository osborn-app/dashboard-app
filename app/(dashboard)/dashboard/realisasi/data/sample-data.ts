import { AccountItem, AccountTableItem, TransactionItem, ReportItem, CategoryItem } from "../types";

export const accountsData: AccountItem[] = [
  {
    id: "10000",
    code: "10000",
    name: "HARTA",
    type: "ASSETS",
    level: 1,
    expanded: true,
    children: [
      {
        id: "11000",
        code: "11000",
        name: "AKTIVA LANCAR",
        type: "CURRENT ASSETS",
        level: 2,
        expanded: true,
        children: [
          {
            id: "11100",
            code: "11100",
            name: "KAS",
            type: "CASH",
            level: 3,
            expanded: false,
            children: []
          }
        ]
      }
    ]
  },
  {
    id: "20000",
    code: "20000",
    name: "DANA BOS",
    type: "BOS FUNDS",
    level: 1,
    expanded: false,
    children: []
  }
];

export const accountTableData: AccountTableItem[] = [
  {
    id: "1",
    code: "10000",
    name: "HARTA",
    type: "ASSETS",
    balance: 50000000,
    status: "active",
    lastUpdated: "2024-01-15"
  },
  {
    id: "2",
    code: "11000",
    name: "AKTIVA LANCAR",
    type: "CURRENT ASSETS",
    balance: 30000000,
    status: "active",
    lastUpdated: "2024-01-15"
  },
  {
    id: "3",
    code: "11100",
    name: "KAS",
    type: "CASH",
    balance: 15000000,
    status: "active",
    lastUpdated: "2024-01-15"
  },
  {
    id: "4",
    code: "20000",
    name: "DANA BOS",
    type: "BOS FUNDS",
    balance: 20000000,
    status: "pending",
    lastUpdated: "2024-01-14"
  }
];

export const transactionData: TransactionItem[] = [
  {
    id: "1",
    date: "2024-01-15",
    category: "Orderan Sewa - Pendapatan Sewa Fleets",
    transactionName: "Nama Kendaraan - Nama Customer",
    accountCode: "11100",
    accountName: "KAS & BANK",
    debit: 300000,
    credit: 0,
    type: "debit",
    parentTransactionId: "1"
  },
  {
    id: "1-credit",
    date: "2024-01-15",
    category: "Orderan Sewa - Pendapatan Sewa Fleets",
    transactionName: "Nama Kendaraan - Nama Customer",
    accountCode: "41000",
    accountName: "Pendapatan Sewa Kendaraan",
    debit: 0,
    credit: 300000,
    type: "credit",
    parentTransactionId: "1"
  },
  {
    id: "2",
    date: "2024-01-14",
    category: "Pembayaran Gaji - Beban Operasional",
    transactionName: "Gaji Guru Bulan Januari 2024",
    accountCode: "11100",
    accountName: "KAS & BANK",
    debit: 0,
    credit: 5000000,
    type: "credit",
    parentTransactionId: "2"
  },
  {
    id: "2-debit",
    date: "2024-01-14",
    category: "Pembayaran Gaji - Beban Operasional",
    transactionName: "Gaji Guru Bulan Januari 2024",
    accountCode: "51000",
    accountName: "Beban Gaji",
    debit: 5000000,
    credit: 0,
    type: "debit",
    parentTransactionId: "2"
  },
  {
    id: "3",
    date: "2024-01-13",
    category: "Pembelian ATK - Beban Operasional",
    transactionName: "Pembelian Alat Tulis Kantor",
    accountCode: "11100",
    accountName: "KAS & BANK",
    debit: 0,
    credit: 500000,
    type: "credit",
    parentTransactionId: "3"
  },
  {
    id: "3-debit",
    date: "2024-01-13",
    category: "Pembelian ATK - Beban Operasional",
    transactionName: "Pembelian Alat Tulis Kantor",
    accountCode: "52000",
    accountName: "Beban ATK",
    debit: 500000,
    credit: 0,
    type: "debit",
    parentTransactionId: "3"
  }
];

export const reportData: ReportItem[] = [
  {
    id: "1",
    title: "Laporan Keuangan Bulanan Januari 2024",
    type: "financial",
    status: "published",
    createdBy: "Admin Keuangan",
    createdAt: "2024-01-15",
    lastModified: "2024-01-15",
    description: "Laporan keuangan lengkap untuk bulan Januari 2024"
  },
  {
    id: "2",
    title: "Laporan Operasional Sekolah",
    type: "operational",
    status: "draft",
    createdBy: "Kepala Sekolah",
    createdAt: "2024-01-14",
    lastModified: "2024-01-14",
    description: "Laporan operasional kegiatan sekolah"
  },
  {
    id: "3",
    title: "Laporan Kepatuhan Dana BOS",
    type: "compliance",
    status: "published",
    createdBy: "Admin Keuangan",
    createdAt: "2024-01-13",
    lastModified: "2024-01-13",
    description: "Laporan kepatuhan penggunaan dana BOS"
  }
];

export const categoryData: CategoryItem[] = [
  {
    id: "1",
    name: "Orderan Sewa - Pendapatan Sewa Fleets",
    debitAccount: "KAS & BANK",
    creditAccount: "Pendapatan Sewa Kendaraan"
  },
  {
    id: "2",
    name: "Pembayaran Gaji - Beban Operasional",
    debitAccount: "Beban Gaji",
    creditAccount: "KAS & BANK"
  },
  {
    id: "3",
    name: "Pembelian ATK - Beban Operasional",
    debitAccount: "Beban ATK",
    creditAccount: "KAS & BANK"
  }
];
