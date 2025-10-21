export interface DriverShift {
  id: string;
  namaDriver: string;
  jenisShift: 'Shift Pagi' | 'Shift Middle' | 'Shift Sore' | 'Full Shift' | 'Libur';
  jamMulai: string;
  jamSelesai: string;
  cabang: string;
  tanggal: string;
  status: 'active' | 'completed' | 'cancelled';
  driverId: string;
  shiftId: string;
}

export const dummyDriverShifts: DriverShift[] = [
  {
    id: '1',
    namaDriver: 'Ahmad Wijaya',
    jenisShift: 'Shift Pagi',
    jamMulai: '07.00',
    jamSelesai: '15.00',
    cabang: 'Pancoran',
    tanggal: '2025-01-20',
    status: 'active',
    driverId: 'DRV001',
    shiftId: 'SHIFT001'
  },
  {
    id: '2',
    namaDriver: 'Budi Santoso',
    jenisShift: 'Shift Middle',
    jamMulai: '11.00',
    jamSelesai: '19.00',
    cabang: 'Matraman',
    tanggal: '2025-01-20',
    status: 'active',
    driverId: 'DRV002',
    shiftId: 'SHIFT002'
  },
  {
    id: '3',
    namaDriver: 'Citra Dewi',
    jenisShift: 'Shift Sore',
    jamMulai: '15.00',
    jamSelesai: '23.00',
    cabang: 'Cengkareng',
    tanggal: '2025-01-20',
    status: 'active',
    driverId: 'DRV003',
    shiftId: 'SHIFT003'
  },
  {
    id: '4',
    namaDriver: 'Dedi Kurniawan',
    jenisShift: 'Full Shift',
    jamMulai: '07.00',
    jamSelesai: '23.00',
    cabang: 'Semanggi',
    tanggal: '2025-01-20',
    status: 'active',
    driverId: 'DRV004',
    shiftId: 'SHIFT004'
  },
  {
    id: '5',
    namaDriver: 'Eka Putri',
    jenisShift: 'Libur',
    jamMulai: '-',
    jamSelesai: '-',
    cabang: '-',
    tanggal: '2025-01-20',
    status: 'active',
    driverId: 'DRV005',
    shiftId: 'SHIFT005'
  },
  {
    id: '6',
    namaDriver: 'Fajar Rahman',
    jenisShift: 'Shift Sore',
    jamMulai: '15.00',
    jamSelesai: '23.00',
    cabang: 'Tanjung Duren',
    tanggal: '2025-01-20',
    status: 'active',
    driverId: 'DRV006',
    shiftId: 'SHIFT006'
  },
  {
    id: '7',
    namaDriver: 'Gita Sari',
    jenisShift: 'Shift Pagi',
    jamMulai: '07.00',
    jamSelesai: '15.00',
    cabang: 'Semanggi',
    tanggal: '2025-01-20',
    status: 'active',
    driverId: 'DRV007',
    shiftId: 'SHIFT007'
  },
  {
    id: '8',
    namaDriver: 'Hendra Pratama',
    jenisShift: 'Shift Middle',
    jamMulai: '11.00',
    jamSelesai: '19.00',
    cabang: 'Pancoran',
    tanggal: '2025-01-20',
    status: 'completed',
    driverId: 'DRV008',
    shiftId: 'SHIFT008'
  },
  {
    id: '9',
    namaDriver: 'Indra Kusuma',
    jenisShift: 'Full Shift',
    jamMulai: '07.00',
    jamSelesai: '23.00',
    cabang: 'Matraman',
    tanggal: '2025-01-20',
    status: 'active',
    driverId: 'DRV009',
    shiftId: 'SHIFT009'
  },
  {
    id: '10',
    namaDriver: 'Joko Susilo',
    jenisShift: 'Libur',
    jamMulai: '-',
    jamSelesai: '-',
    cabang: '-',
    tanggal: '2025-01-20',
    status: 'active',
    driverId: 'DRV010',
    shiftId: 'SHIFT010'
  },
  {
    id: '11',
    namaDriver: 'Kiki Amelia',
    jenisShift: 'Shift Pagi',
    jamMulai: '07.00',
    jamSelesai: '15.00',
    cabang: 'Cengkareng',
    tanggal: '2025-01-20',
    status: 'active',
    driverId: 'DRV011',
    shiftId: 'SHIFT011'
  },
  {
    id: '12',
    namaDriver: 'Lina Marlina',
    jenisShift: 'Shift Sore',
    jamMulai: '15.00',
    jamSelesai: '23.00',
    cabang: 'Semanggi',
    tanggal: '2025-01-20',
    status: 'active',
    driverId: 'DRV012',
    shiftId: 'SHIFT012'
  }
];

// Data untuk filter cabang
export const dummyCabang = [
  'Pancoran',
  'Matraman', 
  'Cengkareng',
  'Semanggi',
  'Tanjung Duren',
  'Kemang',
  'Menteng',
  'Gambir',
  'Senen',
  'Cikini'
];

// Data untuk jenis shift
export const dummyJenisShift = [
  'Shift Pagi',
  'Shift Middle', 
  'Shift Sore',
  'Full Shift',
  'Libur'
];

// Data untuk jam shift
export const dummyJamShift = {
  'Shift Pagi': { mulai: '07.00', selesai: '15.00' },
  'Shift Middle': { mulai: '11.00', selesai: '19.00' },
  'Shift Sore': { mulai: '15.00', selesai: '23.00' },
  'Full Shift': { mulai: '07.00', selesai: '23.00' },
  'Libur': { mulai: '-', selesai: '-' }
};

// Data untuk laporan driver (untuk tab kedua)
export interface DriverReport {
  id: string;
  namaDriver: string;
  pengantaran: number;
  penjemputan: number;
  taskDiluarJamKerja: number;
}

export const dummyDriverReports: DriverReport[] = [
  {
    id: '1',
    namaDriver: 'Ahmad Wijaya',
    pengantaran: 5,
    penjemputan: 7,
    taskDiluarJamKerja: 2
  },
  {
    id: '2',
    namaDriver: 'Budi Santoso',
    pengantaran: 8,
    penjemputan: 6,
    taskDiluarJamKerja: 1
  },
  {
    id: '3',
    namaDriver: 'Citra Dewi',
    pengantaran: 4,
    penjemputan: 9,
    taskDiluarJamKerja: 3
  },
  {
    id: '4',
    namaDriver: 'Dedi Kurniawan',
    pengantaran: 12,
    penjemputan: 8,
    taskDiluarJamKerja: 1
  },
  {
    id: '5',
    namaDriver: 'Eka Putri',
    pengantaran: 6,
    penjemputan: 5,
    taskDiluarJamKerja: 2
  },
  {
    id: '6',
    namaDriver: 'Fajar Rahman',
    pengantaran: 9,
    penjemputan: 7,
    taskDiluarJamKerja: 0
  },
  {
    id: '7',
    namaDriver: 'Gita Sari',
    pengantaran: 7,
    penjemputan: 6,
    taskDiluarJamKerja: 2
  },
  {
    id: '8',
    namaDriver: 'Hendra Pratama',
    pengantaran: 10,
    penjemputan: 8,
    taskDiluarJamKerja: 1
  },
  {
    id: '9',
    namaDriver: 'Indra Kusuma',
    pengantaran: 5,
    penjemputan: 4,
    taskDiluarJamKerja: 3
  },
  {
    id: '10',
    namaDriver: 'Joko Susilo',
    pengantaran: 8,
    penjemputan: 9,
    taskDiluarJamKerja: 1
  }
];
