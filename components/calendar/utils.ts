export const PAYMENT_STATUS = {
  pending: {
    text: "Belum Bayar",
    color: "text-red-900",
    bgColor: "bg-red-50",
  },
  done: {
    text: "Lunas",
    color: "text-green-900",
    bgColor: "bg-green-50",
  },
  "partially paid": {
    text: "Kurang Bayar",
    color: "text-yellow-900",
    bgColor: "bg-yellow-50",
  },
  failed: {
    text: "Gagal",
    color: "text-gray-900",
    bgColor: "bg-gray-50",
  },
};

export const ORDER_STATUS = {
  pending: {
    text: "Menunggu Persetujuan",
    color: "text-red-900",
    bgColor: "bg-red-100",
    bgColorDarker: "bg-red-500",
    border: "hover:border hover:border-red-500",
  },
  done: {
    text: "Selesai",
    color: "text-green-900",
    bgColor: "bg-green-100",
    bgColorDarker: "bg-green-500",
    border: "hover:border hover:border-green-500",
  },
  on_progress: {
    text: "Sedang Berjalan",
    color: "text-blue-900",
    bgColor: "bg-blue-50",
    bgColorDarker: "bg-blue-500",
    border: "hover:border hover:border-blue-500",
  },
  waiting: {
    text: "Menunggu PIC",
    color: "text-neutral-900",
    bgColor: "bg-yellow-100",
    bgColorDarker: "bg-yellow-500",
    border: "hover:border hover:border-yellow-500",
  },
  confirmed: {
    text: "Terkonfirmasi",
    color: "text-orange-900",
    bgColor: "bg-orange-50",
    bgColorDarker: "bg-orange-500",
    border: "hover:border hover:border-orange-500",
  },
  on_going: {
    text: "Sedang Berjalan",
    color: "text-blue-900",
    bgColor: "bg-blue-50",
    bgColorDarker: "bg-blue-500",
    border: "hover:border hover:border-blue-500",
  },
  // Inspection statuses
  completed: {
    text: "Completed",
    color: "text-green-900",
    bgColor: "bg-green-100",
    bgColorDarker: "bg-green-500",
    border: "hover:border hover:border-green-500",
  },
  pending_repair: {
    text: "Pending Repair",
    color: "text-yellow-900",
    bgColor: "bg-yellow-100",
    bgColorDarker: "bg-yellow-500",
    border: "hover:border hover:border-yellow-500",
  },
  // Maintenance statuses
  ongoing: {
    text: "Ongoing",
    color: "text-blue-900",
    bgColor: "bg-blue-100",
    bgColorDarker: "bg-blue-500",
    border: "hover:border hover:border-blue-500",
  },
};

export const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
