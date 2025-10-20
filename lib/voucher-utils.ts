// Helper untuk parse voucher code dan mendapatkan informasi detail
export interface VoucherInfo {
  type: string;
  benefit: string;
  description: string;
  icon: string;
  color: string;
  distance?: string; // Tambahkan field untuk info KM
}

// Helper untuk mendapatkan detail jarak dari benefit voucher
export const getBenefitDistance = (reason: string): string => {
  // Pattern dengan underscore
  if (reason.includes('_10km')) return '10km';
  if (reason.includes('_15km')) return '15km';
  if (reason.includes('_20km')) return '20km';
  
  // Pattern tanpa underscore (untuk voucher code seperti BPICKUPC961S6)
  if (reason.includes('10km')) return '10km';
  if (reason.includes('15km')) return '15km';
  if (reason.includes('20km')) return '20km';
  
  // Pattern dengan angka saja (untuk voucher code yang mungkin menggunakan format berbeda)
  if (reason.includes('10')) return '10km';
  if (reason.includes('15')) return '15km';
  if (reason.includes('20')) return '20km';
  
  // Untuk voucher benefit yang tidak memiliki info KM spesifik, return default
  // Ini akan menampilkan "sesuai ketentuan" di UI
  return '';
};

export const parseVoucherCode = (code: string): VoucherInfo => {
  if (!code) {
    return {
      type: 'No Voucher',
      benefit: 'Tidak ada voucher',
      description: 'Tidak ada voucher yang digunakan',
      icon: '🎫',
      color: 'gray'
    };
  }

  // Benefit vouchers (dimulai dengan B)
  if (code.startsWith('B')) {
    const distance = getBenefitDistance(code);
    
    if (code.includes('PICKUP')) {
      return {
        type: 'Benefit Voucher',
        benefit: distance ? `Gratis Pickup ${distance}` : 'Gratis Pickup',
        description: distance ? `Voucher untuk gratis penjemputan kendaraan (${distance})` : 'Voucher untuk gratis penjemputan kendaraan (jarak sesuai ketentuan)',
        icon: '📦',
        color: 'purple',
        distance: distance || 'sesuai ketentuan'
      };
    } else if (code.includes('DELIV')) {
      return {
        type: 'Benefit Voucher',
        benefit: distance ? `Gratis Antar ${distance}` : 'Gratis Antar',
        description: distance ? `Voucher untuk gratis pengantaran kendaraan (${distance})` : 'Voucher untuk gratis pengantaran kendaraan (jarak sesuai ketentuan)',
        icon: '🚚',
        color: 'blue',
        distance: distance || 'sesuai ketentuan'
      };
    } else if (code.includes('DRIVER')) {
      return {
        type: 'Benefit Voucher',
        benefit: 'Gratis Supir',
        description: 'Voucher untuk gratis layanan supir',
        icon: '👨‍💼',
        color: 'orange'
      };
    } else if (code.includes('ADDON')) {
      return {
        type: 'Benefit Voucher',
        benefit: 'Gratis Addon',
        description: 'Voucher untuk gratis aksesoris tambahan',
        icon: '🎁',
        color: 'pink'
      };
    } else {
      return {
        type: 'Benefit Voucher',
        benefit: 'Benefit Lainnya',
        description: 'Voucher benefit dengan kode tidak dikenali',
        icon: '🎫',
        color: 'blue'
      };
    }
  }
  
  // Referral vouchers (dimulai dengan R)
  if (code.startsWith('R')) {
    return {
      type: 'Referral Voucher',
      benefit: 'Diskon Referral',
      description: 'Voucher dari program referral',
      icon: '🤝',
      color: 'green'
    };
  }
  
  // Loyalty vouchers (dimulai dengan L)
  if (code.startsWith('L')) {
    return {
      type: 'Loyalty Voucher',
      benefit: 'Diskon Loyalty',
      description: 'Voucher dari program loyalitas member',
      icon: '⭐',
      color: 'gold'
    };
  }
  
  // Manual vouchers (dimulai dengan M)
  if (code.startsWith('M')) {
    return {
      type: 'Manual Voucher',
      benefit: 'Diskon Manual',
      description: 'Voucher yang dibuat secara manual oleh admin',
      icon: '✏️',
      color: 'indigo'
    };
  }
  
  // Discount vouchers (kode yang tidak memiliki prefix standar tapi memberikan diskon)
  // Ini untuk menangani voucher discount seperti WIDI8ZYALV
  if (code.length >= 8 && /^[A-Z0-9]+$/.test(code)) {
    return {
      type: 'Discount Voucher',
      benefit: 'Diskon Khusus',
      description: 'Voucher diskon khusus yang memberikan potongan harga',
      icon: '💰',
      color: 'green'
    };
  }
  
  // Default untuk kode yang tidak dikenali
  return {
    type: 'Unknown Voucher',
    benefit: 'Voucher Tidak Dikenali',
    description: 'Voucher dengan kode yang tidak dapat diidentifikasi',
    icon: '❓',
    color: 'gray'
  };
};

// Helper untuk mendapatkan color class berdasarkan voucher type
export const getVoucherColorClass = (color: string) => {
  const colorMap = {
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    pink: 'bg-pink-50 border-pink-200 text-pink-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    gold: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700'
  };
  
  return colorMap[color as keyof typeof colorMap] || colorMap.gray;
};
