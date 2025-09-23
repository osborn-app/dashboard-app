import { NavItem } from "@/types";

export type User = {
  id: number;
  name: string;
  company: string;
  role: string;
  verified: boolean;
  status: string;
};
export const users: User[] = [
  {
    id: 1,
    name: "Candice Schiner",
    company: "Dell",
    role: "Frontend Developer",
    verified: false,
    status: "Active",
  },
  {
    id: 2,
    name: "John Doe",
    company: "TechCorp",
    role: "Backend Developer",
    verified: true,
    status: "Active",
  },
  {
    id: 3,
    name: "Alice Johnson",
    company: "WebTech",
    role: "UI Designer",
    verified: true,
    status: "Active",
  },
  {
    id: 4,
    name: "David Smith",
    company: "Innovate Inc.",
    role: "Fullstack Developer",
    verified: false,
    status: "Inactive",
  },
  {
    id: 5,
    name: "Emma Wilson",
    company: "TechGuru",
    role: "Product Manager",
    verified: true,
    status: "Active",
  },
  {
    id: 6,
    name: "James Brown",
    company: "CodeGenius",
    role: "QA Engineer",
    verified: false,
    status: "Active",
  },
  {
    id: 7,
    name: "Laura White",
    company: "SoftWorks",
    role: "UX Designer",
    verified: true,
    status: "Active",
  },
  {
    id: 8,
    name: "Michael Lee",
    company: "DevCraft",
    role: "DevOps Engineer",
    verified: false,
    status: "Active",
  },
  {
    id: 9,
    name: "Olivia Green",
    company: "WebSolutions",
    role: "Frontend Developer",
    verified: true,
    status: "Active",
  },
  {
    id: 10,
    name: "Robert Taylor",
    company: "DataTech",
    role: "Data Analyst",
    verified: false,
    status: "Active",
  },
];

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string; // Consider using a proper date type if possible
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  longitude?: number; // Optional field
  latitude?: number; // Optional field
  job: string;
  profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture).
};

export type Drivers = {
  id: number;
  name: string;
  status: string;
  email: string;
  date_of_birth: string;
  nik: string;
  role: string;
  id_photo: string;
  gender: string;
  phone_number: string;
  emergency_phone_number: string;
};
export type Requests = {
  id: number;
  name: string;
  status: string;
  email: string;
  date_of_birth: string;
  nik: string;
  role: string;
  id_photo: string;
};

export const navItems: NavItem[] = [
  {
    title: "DASHBOARD",
    label: "Dashboard",
    roles: ["admin", "owner"],
    items: [
      {
        title: "Data",
        href: "/dashboard",
        icon: "dashboard",
        label: "Dashboard",
        roles: ["admin", "owner"],
      },
      {
        title: "Calendar",
        href: "/dashboard/calendar",
        icon: "calendar",
        label: "calendar",
        roles: ["admin", "owner"],
      },
      {
        title: "Request Tasks",
        href: "/dashboard/requests",
        icon: "clipboardList",
        label: "task",
        roles: ["admin"],
      },
    ],
  },
  {
    title: "PESANAN",
    label: "orders",
    roles: ["admin", "finance"],
    items: [
      {
        title: "Pesanan Kendaraan",
        href: "/dashboard/orders",
        icon: "car",
        label: "fleet-orders",
        roles: ["admin", "finance"],
      },
      {
        title: "Pesanan Produk",
        href: "/dashboard/product-orders",
        icon: "package",
        label: "product-orders",
        roles: ["admin", "finance"],
      },
    ],
  },
  {
    title: "PENGGUNA",
    label: "customer",
    roles: ["admin"],
    items: [
      {
        title: "Customers",
        href: "/dashboard/customers",
        icon: "users",
        label: "customer",
        roles: ["admin"],
      },
      {
        title: "Customer Ranking",
        href: "/dashboard/customer-ranking",
        icon: "users",
        label: "customer-ranking",
        roles: ["admin"],
      },
      {
        title: "Owners",
        href: "/dashboard/owners",
        icon: "owners",
        label: "owners",
        roles: ["admin"],
      },
      {
        title: "Verifikasi Tambahan",
        href: "/dashboard/verification",
        icon: "users",
        label: "customer",
        roles: ["admin"],
      },
    ],
  },
  {
    title: "KATALOG",
    label: "Fleet",
    roles: ["admin", "owner"],
    items: [
      {
        title: "Fleets",
        href: "/dashboard/fleets",
        icon: "car",
        label: "Fleet",
        roles: ["admin", "owner"],
      },
      {
        title: "Produk",
        href: "/dashboard/products",
        icon: "package",
        label: "products",
        roles: ["admin", "owner"],
      },
      {
        title: "Add-ons",
        href: "/dashboard/add-ons",
        icon: "package",
        label: "add-ons",
        roles: ["admin"],
      },
      {
        title: "Fleets Mitra Ojol",
        href: "/dashboard/partner-fleets",
        icon: "carpartner",
        label: "Fleet Mitra",
        roles: ["admin"],
      },
      {
        title: "Lokasi",
        href: "/dashboard/location",
        icon: "maps",
        label: "Location",
        roles: ["admin"],
      },
      {
        title: "Discount",
        href: "/dashboard/discount",
        icon: "discount",
        label: "Discount",
        roles: ["admin"],
      },
    ],
  },
  {
    title: "DRIVERS",
    label: "profile",
    roles: ["admin"],
    items: [
      {
        title: "Drivers",
        href: "/dashboard/drivers",
        icon: "profile",
        label: "profile",
        roles: ["admin"],
      },
      {
        title: "Driver Mitra Ojol",
        href: "/dashboard/mitra-drivers",
        icon: "usersicon",
        label: "Driver Mitra",
        roles: ["admin"],
      },
    ],
  },
  {
    title: "PEMASUKAN",
    label: "Pemasukan",
    roles: ["owner"],
    items: [
      {
        title: "Rekap Fleets",
        href: "/dashboard/recap",
        icon: "notebookText",
        label: "recap",
        roles: ["owner"],
      },
      {
        title: "Rekap Produk",
        href: "/dashboard/product-ledgers",
        icon: "ledger",
        label: "product-ledgers",
        roles: ["owner"],
      },
    ],
  },
  {
    title: "INSPEKSI & PERBAIKAN",
    label: "Inspections",
    roles: ["admin", "owner", "operation"],
    items: [
      {
        title: "Inspections",
        href: "/dashboard/inspections",
        icon: "listchecks",
        label: "Inspections",
        roles: ["admin", "owner", "operation"],
      },
      {
        title: "Keperluan & Perbaikan",
        href: "/dashboard/needs",
        icon: "wrench",
        label: "Keperluan Perbaikan",
        roles: ["admin", "owner", "operation"],
      },
    ],
  },
  {
    title: "FITUR TAMBAHAN",
    label: "extra",
    roles: ["admin", "driver", "finance", "operation"],
    items: [
      {
        title: "Reimburse",
        href: "/dashboard/reimburse",
        icon: "hand",
        label: "reimburse",
        roles: ["admin", "finance", "driver"],
      },
      {
        title: "Buru Sergap",
        href: "/dashboard/buser",
        icon: "footprints",
        label: "Buru Sergap",
        roles: ["admin", "operation"],
      },
      {
        title: "Template Pesan Fleet",
        href: "/dashboard/wa-blas-partner",
        icon: "phonecall",
        label: "Template Pesan Fleet",
        roles: ["admin"],
      },
    ],
  },
  {
    title: "KEUANGAN",
    label: "keuangan",
    roles: ["finance"],
    items: [
      {
        title: "Rekap Pencatatan",
        href: "/dashboard/rekap-pencatatan",
        icon: "contentImage",
        label: "Rekap Pencatatan",
        roles: ["finance"]
      },
      {
        title: "Realisasi",
        href: "/dashboard/realisasi",
        icon: "contentImage",
        label: "realisasi",
        roles: ["finance"]
      },
      {
        title: "Perencanaan",
        href: "/dashboard/perencanaan",
        icon: "notebookText",
        label: "Perencanaan",
        roles: ["finance"]
      },
      {
        title: "Inventaris",
        href: "/dashboard/inventaris",
        icon: "archive",
        label: "Inventaris",
        roles: ["finance"]
      },
    ],
  },
  {
    title: "Content Management System",
    label: "extra",
    roles: [""],
    items: [
      {
        title: "Content Management",
        href: "/dashboard/cms",
        icon: "contentImage",
        label: "Content Management",
        roles: [""]
      },
      {
        title: "Kategori CMS",
        href: "/dashboard/category-cms",
        icon: "contentImage",
        label: "Kategori CMS",
        roles: [""]
      },
    ],
  },
];

