import { Perencanaan, RencanaAnggaran, RencanaAccount } from "@/types/perencanaan";

export const dummyPerencanaanData: Perencanaan[] = [
  {
    id: "1",
    name: "PENAMBAHAN UNIT LAMBORGHINI",
    startDate: "2025-08-20",
    endDate: "2026-08-20",
    totalValue: 20000000000,
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    name: "PENAMBAHAN UNIT FERRARI",
    startDate: "2025-09-01",
    endDate: "2026-09-01",
    totalValue: 25000000000,
    status: "draft",
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z"
  },
  {
    id: "3",
    name: "PENAMBAHAN UNIT PORSCHE",
    startDate: "2025-07-15",
    endDate: "2026-07-15",
    totalValue: 18000000000,
    status: "completed",
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-20T16:45:00Z"
  },
  {
    id: "4",
    name: "PENAMBAHAN UNIT BMW",
    startDate: "2025-10-01",
    endDate: "2026-10-01",
    totalValue: 15000000000,
    status: "active",
    createdAt: "2024-01-18T11:00:00Z",
    updatedAt: "2024-01-18T11:00:00Z"
  },
  {
    id: "5",
    name: "PENAMBAHAN UNIT AUDI",
    startDate: "2025-11-01",
    endDate: "2026-11-01",
    totalValue: 12000000000,
    status: "draft",
    createdAt: "2024-01-20T13:30:00Z",
    updatedAt: "2024-01-20T13:30:00Z"
  }
];

export const dummyRencanaAnggaran: RencanaAnggaran[] = [
  {
    id: "1",
    name: "Rencana Anggaran Lamborghini",
    planningDate: "2025-08-20",
    generalAmount: 20000000000,
    planningId: "1",
    accounts: [
      {
        id: "1",
        accountName: "Kas",
        debit: 5000000000,
        credit: 0,
        rencanaId: "1"
      },
      {
        id: "2",
        accountName: "Bank",
        debit: 15000000000,
        credit: 0,
        rencanaId: "1"
      },
      {
        id: "3",
        accountName: "Modal",
        debit: 0,
        credit: 20000000000,
        rencanaId: "1"
      }
    ],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    name: "Rencana Anggaran Ferrari",
    planningDate: "2025-09-01",
    generalAmount: 25000000000,
    planningId: "2",
    accounts: [
      {
        id: "4",
        accountName: "Kas",
        debit: 10000000000,
        credit: 0,
        rencanaId: "2"
      },
      {
        id: "5",
        accountName: "Bank",
        debit: 15000000000,
        credit: 0,
        rencanaId: "2"
      },
      {
        id: "6",
        accountName: "Modal",
        debit: 0,
        credit: 25000000000,
        rencanaId: "2"
      }
    ],
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z"
  }
];

// Dummy data for transaction entries (flattened from rencana anggaran)
export const dummyRencanaTransactions = [
  {
    id: "1",
    tanggal: "2025-08-01",
    status: "Belum Terealisasi",
    keterangan: "Nama Rencana",
    namaAkun: "11100 - KAS & BANK",
    debit: 300000,
    kredit: 0,
    planningId: "1",
    rencanaId: "1",
    transactionGroup: "1", // Group ID for Excel-like grouping
    isFirstInGroup: true // Flag to show which row should display group info
  },
  {
    id: "2",
    tanggal: "",
    status: "",
    keterangan: "",
    namaAkun: "41000 - Inventaris",
    debit: 0,
    kredit: 300000,
    planningId: "1",
    rencanaId: "1",
    transactionGroup: "1",
    isFirstInGroup: false
  },
  {
    id: "3",
    tanggal: "2025-08-02",
    status: "Belum Terealisasi",
    keterangan: "Pembelian Kendaraan",
    namaAkun: "11100 - KAS & BANK",
    debit: 5000000000,
    kredit: 0,
    planningId: "1",
    rencanaId: "1",
    transactionGroup: "2",
    isFirstInGroup: true
  },
  {
    id: "4",
    tanggal: "",
    status: "",
    keterangan: "",
    namaAkun: "12000 - KENDARAAN",
    debit: 0,
    kredit: 5000000000,
    planningId: "1",
    rencanaId: "1",
    transactionGroup: "2",
    isFirstInGroup: false
  }
];

export const dummyAkunData = [
  {
    id: "1",
    code: "10000",
    name: "HARTA",
    type: "parent" as const,
    children: [
      {
        id: "2",
        code: "11000",
        name: "AKTIVA LANCAR",
        type: "child" as const,
        children: [
          {
            id: "3",
            code: "11100",
            name: "KAS",
            type: "account" as const
          },
          {
            id: "4",
            code: "11200",
            name: "BANK",
            type: "account" as const
          }
        ]
      },
      {
        id: "5",
        code: "12000",
        name: "AKTIVA TETAP",
        type: "child" as const,
        children: [
          {
            id: "6",
            code: "12100",
            name: "KENDARAAN",
            type: "account" as const
          },
          {
            id: "7",
            code: "12200",
            name: "GEDUNG",
            type: "account" as const
          }
        ]
      }
    ]
  },
  {
    id: "8",
    code: "20000",
    name: "KEWAJIBAN",
    type: "parent" as const,
    children: [
      {
        id: "9",
        code: "21000",
        name: "KEWAJIBAN LANCAR",
        type: "child" as const,
        children: [
          {
            id: "10",
            code: "21100",
            name: "HUTANG USAHA",
            type: "account" as const
          }
        ]
      }
    ]
  },
  {
    id: "11",
    code: "30000",
    name: "MODAL",
    type: "parent" as const,
    children: [
      {
        id: "12",
        code: "31000",
        name: "MODAL SAHAM",
        type: "child" as const,
        children: [
          {
            id: "13",
            code: "31100",
            name: "MODAL DISETOR",
            type: "account" as const
          }
        ]
      }
    ]
  }
];

export const dummyPerencanaanStatistics = {
  total: 5,
  active: 2,
  completed: 1,
  draft: 2,
  totalValue: 90000000000
};
