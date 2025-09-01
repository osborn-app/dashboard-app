# 📊 Recap Transactions API Documentation

## 🔗 Base URL
```
{{base_url}}/v1/rekap-transaksi
```

## 🔐 Authentication
Semua endpoint memerlukan JWT Bearer Token:
```
Authorization: Bearer {{token}}
```

## 👥 Role Requirements
- **ADMIN**: Akses penuh ke semua endpoint
- **OWNER**: Akses read-only untuk semua tab, export data

---

## 📝 Endpoint Documentation

### 1. **GET** `/v1/rekap-transaksi/:tab` - Get Recap Transactions List

**Description:** Mendapatkan daftar transaksi berdasarkan tab yang dipilih dengan pagination dan filter

**Headers:**
```
Authorization: Bearer {{token}}
```

**Path Parameters:**
| Parameter | Type | Required | Description | Values |
|-----------|------|----------|-------------|--------|
| `tab` | string | ✅ | Tab transaksi yang ingin ditampilkan | `orderan-sewa`, `reimburse`, `inventaris`, `lainnya` |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | ❌ | 1 | Halaman yang ingin ditampilkan |
| `limit` | number | ❌ | 20 | Jumlah item per halaman |
| `sortBy` | string | ❌ | - | Field untuk sorting |
| `sortDir` | string | ❌ | - | Arah sorting (`ASC` atau `DESC`) |
| `q` | string | ❌ | - | Query pencarian |
| `startDate` | string | ❌ | - | Tanggal mulai (format: YYYY-MM-DD) |
| `endDate` | string | ❌ | - | Tanggal akhir (format: YYYY-MM-DD) |
| `invoiceNo` | string | ❌ | - | Nomor invoice (khusus tab orderan-sewa) |
| `nama` | string | ❌ | - | Nama (khusus tab tertentu) |

**Response Success (200):**

**Tab: orderan-sewa**
```json
{
  "items": [
    {
      "id": 1,
      "invoice_number": "INV-2024-001",
      "start_date": "2024-01-15T00:00:00.000Z",
      "duration": 3,
      "service_price": 500000,
      "total_price": 1500000,
      "payment_status": "done",
      "customer": {
        "id": 1,
        "name": "John Doe",
        "phone": "+6281234567890"
      },
      "fleet": {
        "id": 1,
        "name": "Toyota Avanza",
        "plate_number": "B 1234 ABC"
      },
      "additional_services": [
        {
          "name": "Weekend Charge",
          "price": 100000
        }
      ],
      "insurance": {
        "price": 50000
      },
      "driver_price": 75000,
      "out_of_town_price": 0
    }
  ],
  "meta": {
    "total_items": 150,
    "item_count": 20,
    "items_per_page": 20,
    "total_pages": 8,
    "current_page": 1
  }
}
```

**Tab: reimburse**
```json
{
  "items": [
    {
      "id": 1,
      "driver_name": "Ahmad Supriadi",
      "nominal": 250000,
      "payment_method": "Bank Transfer",
      "bank_name": "BCA",
      "account_number": "1234567890",
      "description": "Reimburse bensin",
      "status": "approved",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "total_items": 45,
    "item_count": 20,
    "items_per_page": 20,
    "total_pages": 3,
    "current_page": 1
  }
}
```

**Tab: inventaris**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Laptop Dell XPS 13",
      "quantity": 2,
      "unit_price": 15000000,
      "total": 30000000,
      "date": "2024-01-15T00:00:00.000Z",
      "description": "Laptop untuk tim development",
      "status": "verified"
    }
  ],
  "meta": {
    "total_items": 25,
    "item_count": 20,
    "items_per_page": 20,
    "total_pages": 2,
    "current_page": 1
  }
}
```

**Tab: lainnya**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Biaya Internet Bulanan",
      "date": "2024-01-15T00:00:00.000Z",
      "nominal": 500000,
      "payment_method": "Bank Transfer",
      "description": "Pembayaran internet kantor",
      "category": "Operasional"
    }
  ],
  "meta": {
    "total_items": 30,
    "item_count": 20,
    "items_per_page": 20,
    "total_pages": 2,
    "current_page": 1
  }
}
```

**Error Responses:**
- `400` - Bad Request (Parameter tidak valid)
- `401` - Unauthorized (Token tidak valid)
- `403` - Forbidden (Tidak punya akses)

---

### 2. **GET** `/v1/rekap-transaksi/:tab/:id` - Get Transaction Detail

**Description:** Mendapatkan detail transaksi berdasarkan ID

**Headers:**
```
Authorization: Bearer {{token}}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tab` | string | ✅ | Tab transaksi | `orderan-sewa`, `reimburse`, `inventaris`, `lainnya` |
| `id` | number | ✅ | ID transaksi |

**Response Success (200):**

**Tab: orderan-sewa**
```json
{
  "id": 1,
  "invoice_number": "INV-2024-001",
  "start_date": "2024-01-15T00:00:00.000Z",
  "duration": 3,
  "service_price": 500000,
  "total_price": 1500000,
  "payment_status": "done",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "phone": "+6281234567890",
    "email": "john@example.com"
  },
  "fleet": {
    "id": 1,
    "name": "Toyota Avanza",
    "plate_number": "B 1234 ABC",
    "year": 2022
  },
  "additional_services": [
    {
      "name": "Weekend Charge",
      "price": 100000
    }
  ],
  "insurance": {
    "price": 50000,
    "type": "basic"
  },
  "driver_price": 75000,
  "out_of_town_price": 0,
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z"
}
```

**Tab: lainnya**
```json
{
  "id": 1,
  "name": "Biaya Internet Bulanan",
  "date": "2024-01-15T00:00:00.000Z",
  "nominal": 500000,
  "payment_method": "Bank Transfer",
  "description": "Pembayaran internet kantor",
  "category": "Operasional",
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z"
}
```

**Error Responses:**
- `404` - Not Found (Transaksi tidak ditemukan)
- `401` - Unauthorized (Token tidak valid)
- `403` - Forbidden (Tidak punya akses)

---

### 3. **POST** `/v1/rekap-transaksi/lainnya` - Create Other Transaction

**Description:** Membuat transaksi lainnya baru (Hanya untuk tab 'lainnya')

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Request Body:**
```json
{
  "name": "Biaya Internet Bulanan",
  "date": "2024-01-15",
  "nominal": 500000,
  "payment_method": "Bank Transfer",
  "description": "Pembayaran internet kantor",
  "category": "Operasional"
}
```

**Field Descriptions:**
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `name` | string | ✅ | Nama transaksi | Tidak boleh kosong |
| `date` | string | ✅ | Tanggal transaksi | Format: YYYY-MM-DD |
| `nominal` | number | ✅ | Nominal transaksi | Harus positif |
| `payment_method` | string | ❌ | Metode pembayaran | - |
| `description` | string | ❌ | Deskripsi transaksi | - |
| `category` | string | ❌ | Kategori transaksi | - |

**Response Success (201):**
```json
{
  "id": 1,
  "name": "Biaya Internet Bulanan",
  "date": "2024-01-15T00:00:00.000Z",
  "nominal": 500000,
  "payment_method": "Bank Transfer",
  "description": "Pembayaran internet kantor",
  "category": "Operasional",
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z"
}
```

**Error Responses:**
- `400` - Bad Request (Data tidak valid)
- `401` - Unauthorized (Token tidak valid)
- `403` - Forbidden (Tidak punya akses)

---

### 4. **PATCH** `/v1/rekap-transaksi/:tab/:id` - Update Transaction

**Description:** Mengupdate transaksi berdasarkan ID (Hanya untuk tab 'lainnya', 'reimburse', 'inventaris')

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tab` | string | ✅ | Tab transaksi | `lainnya`, `reimburse`, `inventaris` |
| `id` | number | ✅ | ID transaksi |

**Request Body (Tab: lainnya):**
```json
{
  "name": "Biaya Internet Bulanan Updated",
  "nominal": 550000,
  "description": "Pembayaran internet kantor - updated"
}
```

**Request Body (Tab: reimburse):**
```json
{
  "status": "approved",
  "nominal": 250000
}
```

**Request Body (Tab: inventaris):**
```json
{
  "status": "verified",
  "quantity": 3,
  "total": 45000000
}
```

**Response Success (200):**
```json
{
  "id": 1,
  "name": "Biaya Internet Bulanan Updated",
  "date": "2024-01-15T00:00:00.000Z",
  "nominal": 550000,
  "payment_method": "Bank Transfer",
  "description": "Pembayaran internet kantor - updated",
  "category": "Operasional",
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z"
}
```

**Error Responses:**
- `400` - Bad Request (Data tidak valid)
- `404` - Not Found (Transaksi tidak ditemukan)
- `401` - Unauthorized (Token tidak valid)
- `403` - Forbidden (Tidak punya akses)

---

### 5. **DELETE** `/v1/rekap-transaksi/:tab/:id` - Delete Transaction

**Description:** Menghapus transaksi berdasarkan ID (Hanya untuk tab 'lainnya', 'reimburse', 'inventaris')

**Headers:**
```
Authorization: Bearer {{token}}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tab` | string | ✅ | Tab transaksi | `lainnya`, `reimburse`, `inventaris` |
| `id` | number | ✅ | ID transaksi |

**Response Success (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `404` - Not Found (Transaksi tidak ditemukan)
- `401` - Unauthorized (Token tidak valid)
- `403` - Forbidden (Tidak punya akses)

---

### 6. **GET** `/v1/rekap-transaksi/:tab/export` - Export Transactions

**Description:** Mengekspor data transaksi ke format Excel

**Headers:**
```
Authorization: Bearer {{token}}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tab` | string | ✅ | Tab transaksi | `orderan-sewa`, `reimburse`, `inventaris`, `lainnya` |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `format` | string | ❌ | xlsx | Format file | `xlsx`, `xls` |
| `q` | string | ❌ | - | Query pencarian |
| `startDate` | string | ❌ | - | Tanggal mulai |
| `endDate` | string | ❌ | - | Tanggal akhir |
| `invoiceNo` | string | ❌ | - | Nomor invoice (khusus orderan-sewa) |

**Response Success (200):**
File Excel akan di-download dengan nama: `{tab}-{timestamp}.{format}`

**Contoh nama file:**
- `orderan-sewa-2024-01-15T10:30:00.000Z.xlsx`
- `reimburse-2024-01-15T10:30:00.000Z.xlsx`

**Error Responses:**
- `400` - Bad Request (Format tidak valid)
- `401` - Unauthorized (Token tidak valid)
- `403` - Forbidden (Tidak punya akses)

---

## 📊 Data Structure

### Tab: orderan-sewa
Data transaksi sewa kendaraan yang sudah selesai pembayaran.

**Fields:**
- `id`: ID transaksi
- `invoice_number`: Nomor invoice
- `start_date`: Tanggal mulai sewa
- `duration`: Lama sewa (hari)
- `service_price`: Harga unit per hari
- `total_price`: Total harga sewa
- `payment_status`: Status pembayaran
- `customer`: Data customer
- `fleet`: Data kendaraan
- `additional_services`: Layanan tambahan
- `insurance`: Data asuransi
- `driver_price`: Harga driver
- `out_of_town_price`: Harga luar kota

### Tab: reimburse
Data reimburse driver.

**Fields:**
- `id`: ID transaksi
- `driver_name`: Nama driver
- `nominal`: Nominal reimburse
- `payment_method`: Metode pembayaran
- `bank_name`: Nama bank
- `account_number`: Nomor rekening
- `description`: Deskripsi
- `status`: Status approval

### Tab: inventaris
Data pembelian inventaris/perlengkapan.

**Fields:**
- `id`: ID transaksi
- `name`: Nama item
- `quantity`: Jumlah
- `unit_price`: Harga satuan
- `total`: Total harga
- `date`: Tanggal pembelian
- `description`: Deskripsi
- `status`: Status verifikasi

### Tab: lainnya
Data transaksi lainnya yang tidak masuk kategori di atas.

**Fields:**
- `id`: ID transaksi
- `name`: Nama transaksi
- `date`: Tanggal transaksi
- `nominal`: Nominal
- `payment_method`: Metode pembayaran
- `description`: Deskripsi
- `category`: Kategori

---

## 🔄 Realisasi Transaksi

Sistem juga menyediakan fitur realisasi transaksi yang memetakan setiap transaksi ke akun debit dan kredit untuk keperluan akuntansi.

**Entity: RealisasiTransaksiEntity**
```json
{
  "id": 1,
  "tab_asal": "orderan-sewa",
  "asal_id": 123,
  "kategori": "Pendapatan Sewa",
  "akun_debit": "Kas",
  "akun_kredit": "Pendapatan Sewa",
  "nominal": 1500000,
  "tanggal": "2024-01-15T00:00:00.000Z",
  "snapshot": {},
  "active": true
}
```

---

## 📝 Notes

1. **Pagination**: Semua endpoint list menggunakan pagination dengan default 20 item per halaman
2. **Filtering**: Setiap tab memiliki filter yang berbeda sesuai dengan kebutuhan data
3. **Export**: Format export hanya mendukung Excel (.xlsx, .xls)
4. **Authorization**: Tab 'orderan-sewa' hanya bisa di-read, tidak bisa di-create/update/delete
5. **Soft Delete**: Delete operation menggunakan soft delete (data tidak benar-benar dihapus)
6. **Date Format**: Gunakan format ISO 8601 untuk tanggal (YYYY-MM-DD)
7. **Search**: Query parameter 'q' melakukan pencarian case-insensitive 