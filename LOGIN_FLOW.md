# Login Flow Diagram

```mermaid
graph TD
    A[User mengakses aplikasi] --> B[Halaman Role Selection]
    B --> C{User memilih role}
    C --> D[Simpan role ke localStorage]
    D --> E[Redirect ke /login?role=selected_role]
    E --> F[Halaman Login dengan desain split screen]
    F --> G{User input email & password}
    G --> H[Kirim ke API /api/auth/login]
    H --> I{Validasi kredensial}
    I -->|Valid| J[Return user data + token]
    I -->|Invalid| K[Tampilkan error message]
    J --> L[NextAuth session created]
    L --> M[Redirect ke /dashboard]
    M --> N[Dashboard sesuai role]
    K --> F
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style F fill:#f3e5f5
    style N fill:#e8f5e8
    style K fill:#ffebee
```

## Penjelasan Flow:

1. **Role Selection** - User memilih dari 6 role yang tersedia
2. **Login** - User login dengan email/password sesuai role
3. **Validation** - Sistem validasi kredensial dan role
4. **Dashboard** - Redirect ke dashboard sesuai role yang dipilih

## Role-based Access:
- **Super Admin**: Akses penuh
- **Owner**: Calendar, Fleets, Recap, Order Detail
- **Finance**: Fitur keuangan
- **Admin**: Administrasi
- **Operation**: Operasional  
- **Driver**: Fitur driver
