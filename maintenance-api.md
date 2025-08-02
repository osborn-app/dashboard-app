# 📋 Maintenance API Documentation

## 🔗 Base URL
```
{{base_url}}/v1/maintenance
```

## 🔐 Authentication
Semua endpoint memerlukan JWT Bearer Token:
```
Authorization: Bearer {{token}}
```

---

## 📝 Endpoint Documentation

### 1. **POST** `/v1/maintenance` - Create Maintenance

**Description:** Membuat maintenance baru untuk fleet

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Request Body:**
```json
{
  "name": "Servis Berkala Toyota Avanza",
  "description": "Servis rutin 10.000 km, ganti oli, filter udara, dan cek rem",
  "estimate_days": 3,
  "start_date": "2024-01-20T08:00:00.000Z",
  "fleet_id": 371
}
```

**Field Descriptions:**
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `name` | string | ✅ | Nama maintenance | Tidak boleh kosong |
| `description` | string | ❌ | Deskripsi maintenance | Opsional |
| `estimate_days` | number | ✅ | Estimasi hari maintenance | Minimal 1 hari |
| `start_date` | string | ✅ | Tanggal mulai maintenance | Format ISO 8601 |
| `fleet_id` | number | ✅ | ID fleet yang akan di-maintenance | Fleet harus ada |

**Business Rules:**
- Fleet harus berstatus `preparation`
- Start date tidak boleh di masa lalu
- Tidak boleh ada maintenance ongoing untuk fleet yang sama
- Maintenance akan otomatis berstatus `ongoing`

**Response Success (201):**
```json
{
  "id": 1,
  "name": "Servis Berkala Toyota Avanza",
  "description": "Servis rutin 10.000 km, ganti oli, filter udara, dan cek rem",
  "estimate_days": 3,
  "start_date": "2024-01-20T08:00:00.000Z",
  "end_date": "2024-01-23T08:00:00.000Z",
  "status": "ongoing",
  "fleet_id": 371,
  "created_at": "2024-01-15T12:00:00.000Z",
  "updated_at": "2024-01-15T12:00:00.000Z"
}
```

**Error Responses:**
- `400` - Bad Request (Data tidak valid)
- `401` - Unauthorized (Token tidak valid)
- `404` - Not Found (Fleet tidak ditemukan)
- `422` - Unprocessable Entity (Fleet tidak dalam status preparation/Start date di masa lalu/Maintenance overlapping)

---

### 2. **GET** `/v1/maintenance` - Get All Maintenances

**Description:** Mendapatkan daftar maintenance dengan pagination dan filter

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Parameters:**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `q` | string | ❌ | Search query | `"servis"` |
| `status` | enum | ❌ | Filter by status | `"ongoing"` atau `"done"` |
| `fleet_id` | string | ❌ | Filter by fleet ID | `"371"` |
| `page` | number | ❌ | Page number (default: 1) | `1` |
| `limit` | number | ❌ | Items per page (default: 10) | `20` |

**Example URL:**
```
GET /v1/maintenance?status=ongoing&fleet_id=371&page=1&limit=10
```

**Response Success (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Servis Berkala Toyota Avanza",
      "description": "Servis rutin 10.000 km",
      "estimate_days": 3,
      "start_date": "2024-01-20T08:00:00.000Z",
      "end_date": "2024-01-23T08:00:00.000Z",
      "status": "ongoing",
      "fleet_id": 371,
      "created_at": "2024-01-15T12:00:00.000Z",
      "updated_at": "2024-01-15T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

---

### 3. **GET** `/v1/maintenance/:id` - Get Maintenance by ID

**Description:** Mendapatkan detail maintenance berdasarkan ID

**Headers:**
```
Authorization: Bearer {{token}}
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | ID maintenance |

**Example URL:**
```
GET /v1/maintenance/1
```

**Response Success (200):**
```json
{
  "id": 1,
  "name": "Servis Berkala Toyota Avanza",
  "description": "Servis rutin 10.000 km",
  "estimate_days": 3,
  "start_date": "2024-01-20T08:00:00.000Z",
  "end_date": "2024-01-23T08:00:00.000Z",
  "status": "ongoing",
  "fleet_id": 371,
  "fleet": {
    "id": 371,
    "name": "Toyota Avanza 2023",
    "plate_number": "B 1234 ABC"
  },
  "created_at": "2024-01-15T12:00:00.000Z",
  "updated_at": "2024-01-15T12:00:00.000Z"
}
```

**Error Responses:**
- `404` - Not Found (Maintenance tidak ditemukan)

---

### 4. **PATCH** `/v1/maintenance/:id` - Update Maintenance

**Description:** Mengupdate data maintenance

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | ID maintenance |

**Request Body:**
```json
{
  "name": "Servis Berkala Toyota Avanza - Updated",
  "description": "Servis rutin 10.000 km dengan tambahan cek AC",
  "estimate_days": 4,
  "start_date": "2024-01-21T08:00:00.000Z",
  "fleet_id": 371
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ❌ | Nama maintenance |
| `description` | string | ❌ | Deskripsi maintenance |
| `estimate_days` | number | ❌ | Estimasi hari maintenance |
| `start_date` | string | ❌ | Tanggal mulai maintenance |
| `fleet_id` | number | ❌ | ID fleet |

**Response Success (200):**
```json
{
  "id": 1,
  "name": "Servis Berkala Toyota Avanza - Updated",
  "description": "Servis rutin 10.000 km dengan tambahan cek AC",
  "estimate_days": 4,
  "start_date": "2024-01-21T08:00:00.000Z",
  "end_date": "2024-01-25T08:00:00.000Z",
  "status": "ongoing",
  "fleet_id": 371,
  "updated_at": "2024-01-15T13:00:00.000Z"
}
```

**Error Responses:**
- `404` - Not Found (Maintenance tidak ditemukan)

---

### 5. **DELETE** `/v1/maintenance/:id` - Delete Maintenance

**Description:** Menghapus maintenance

**Headers:**
```
Authorization: Bearer {{token}}
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | ID maintenance |

**Example URL:**
```
DELETE /v1/maintenance/1
```

**Response Success (200):**
```json
{
  "message": "Maintenance deleted successfully"
}
```

**Error Responses:**
- `404` - Not Found (Maintenance tidak ditemukan)

---

### 6. **POST** `/v1/maintenance/:id/done` - Mark Maintenance as Done

**Description:** Menandai maintenance sebagai selesai dan mengupdate status fleet

**Headers:**
```
Authorization: Bearer {{token}}
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | ID maintenance |

**Example URL:**
```
POST /v1/maintenance/1/done
```

**Response Success (200):**
```json
{
  "id": 1,
  "name": "Servis Berkala Toyota Avanza",
  "description": "Servis rutin 10.000 km",
  "estimate_days": 3,
  "start_date": "2024-01-20T08:00:00.000Z",
  "end_date": "2024-01-23T08:00:00.000Z",
  "status": "done",
  "fleet_id": 371,
  "updated_at": "2024-01-15T14:00:00.000Z"
}
```

**Business Logic:**
- Maintenance status berubah dari `ongoing` ke `done`
- Fleet status otomatis berubah dari `preparation` ke `available`

**Error Responses:**
- `404` - Not Found (Maintenance tidak ditemukan)
- `422` - Unprocessable Entity (Maintenance sudah done)

---

### 7. **GET** `/v1/maintenance/fleet/:fleetId` - Get Maintenances by Fleet ID

**Description:** Mendapatkan semua maintenance untuk fleet tertentu

**Headers:**
```
Authorization: Bearer {{token}}
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `fleetId` | number | ID fleet |

**Example URL:**
```
GET /v1/maintenance/fleet/371
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Servis Berkala Toyota Avanza",
    "description": "Servis rutin 10.000 km",
    "estimate_days": 3,
    "start_date": "2024-01-20T08:00:00.000Z",
    "end_date": "2024-01-23T08:00:00.000Z",
    "status": "ongoing",
    "fleet_id": 371,
    "created_at": "2024-01-15T12:00:00.000Z",
    "updated_at": "2024-01-15T12:00:00.000Z"
  }
]
```

---

### 8. **POST** `/v1/maintenance/check-status` - Manual Status Check

**Description:** Trigger manual untuk mengecek dan update status maintenance

**Headers:**
```
Authorization: Bearer {{token}}
```

**Example URL:**
```
POST /v1/maintenance/check-status
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Maintenance status check completed successfully"
}
```

**Business Logic:**
- Mengecek semua maintenance dengan status `ongoing`
- Jika `end_date` sudah lewat, status berubah ke `done`
- Fleet status otomatis berubah ke `available`

---

## 🔄 Status Enums

### Maintenance Status
```typescript
enum MaintenanceStatusEnum {
  ONGOING = 'ongoing',
  DONE = 'done'
}
```

### Fleet Status
```typescript
enum FleetStatusEnum {
  AVAILABLE = 'available',
  PREPARATION = 'preparation'
}
```

---

## ⏰ Cron Jobs

Sistem maintenance memiliki cron jobs otomatis:

1. **Daily Check** - Setiap hari jam 00:00
2. **Hourly Check** - Setiap jam
3. **6-Hour Check** - Setiap 6 jam

Cron jobs akan mengecek maintenance yang sudah melewati `end_date` dan mengupdate statusnya otomatis.

---

## 📋 Contoh Testing di Postman

### Collection Variables
```
base_url: http://localhost:3000
token: {{your_jwt_token}}
```

### Test Cases

#### 1. Create Maintenance
```
POST {{base_url}}/v1/maintenance
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "Servis Berkala Toyota Avanza",
  "description": "Servis rutin 10.000 km, ganti oli, filter udara, dan cek rem",
  "estimate_days": 3,
  "start_date": "2024-01-20T08:00:00.000Z",
  "fleet_id": 371
}
```

#### 2. Get All Maintenances
```
GET {{base_url}}/v1/maintenance?status=ongoing&page=1&limit=10
Authorization: Bearer {{token}}
```

#### 3. Mark Maintenance as Done
```
POST {{base_url}}/v1/maintenance/1/done
Authorization: Bearer {{token}}
```

#### 4. Manual Status Check
```
POST {{base_url}}/v1/maintenance/check-status
Authorization: Bearer {{token}}
```

---

## 🚨 Error Handling

### Common Error Codes
- `400` - Bad Request (Data tidak valid)
- `401` - Unauthorized (Token tidak valid)
- `403` - Forbidden (Tidak punya akses)
- `404` - Not Found (Resource tidak ditemukan)
- `422` - Unprocessable Entity (Business rule violation)

### Error Response Format
```json
{
  "statusCode": 422,
  "message": "Fleet must be in preparation status",
  "error": "Unprocessable Entity"
}
```

---

## 🔗 Related Endpoints

### Fleet Status Update
Untuk mengupdate status fleet sebelum membuat maintenance:

```
PUT {{base_url}}/v1/fleets/371/status
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "status": "preparation"
}
```

### Get Fleet Details
Untuk mendapatkan detail fleet:

```
GET {{base_url}}/v1/fleets/371
Authorization: Bearer {{token}}
```

---

## 📊 Business Flow

### 1. Fleet Preparation
1. Fleet status: `available` → `preparation`
2. Fleet siap untuk maintenance

### 2. Create Maintenance
1. Buat maintenance dengan fleet ID
2. Maintenance status: `ongoing`
3. Fleet tetap dalam status `preparation`

### 3. Maintenance Completion
1. Manual: Call `POST /maintenance/:id/done`
2. Auto: Cron job mengecek `end_date`
3. Maintenance status: `ongoing` → `done`
4. Fleet status: `preparation` → `available`

---

## 🛠️ Development Notes

### Database Schema
```sql
-- Maintenances table
CREATE TABLE maintenances (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  estimate_days INTEGER NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status maintenance_status_enum DEFAULT 'ongoing',
  fleet_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,
  FOREIGN KEY (fleet_id) REFERENCES fleets(id) ON DELETE CASCADE
);

-- Fleet status enum
CREATE TYPE fleet_status_enum AS ENUM ('available', 'preparation');

-- Maintenance status enum
CREATE TYPE maintenance_status_enum AS ENUM ('ongoing', 'done');
```

### Environment Variables
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=your_db_name
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

---

## 📝 Changelog

### Version 1.0.0
- ✅ Create maintenance
- ✅ Get all maintenances with pagination
- ✅ Get maintenance by ID
- ✅ Update maintenance
- ✅ Delete maintenance
- ✅ Mark maintenance as done
- ✅ Get maintenances by fleet ID
- ✅ Manual status check endpoint
- ✅ Cron jobs for automatic status updates
- ✅ Fleet status integration
- ✅ Business rule validations 