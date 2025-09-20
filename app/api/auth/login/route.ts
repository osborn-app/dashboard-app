import { NextRequest, NextResponse } from "next/server";

// Mock data untuk testing - dalam implementasi nyata, ini akan mengambil dari database
const mockUsers = [
  {
    id: "1",
    email: "superadmin@example.com",
    password: "superadmin123",
    role: "super_admin",
    name: "Super Admin",
  },
  {
    id: "2",
    email: "owner@example.com",
    password: "owner123",
    role: "owner",
    name: "Owner",
  },
  {
    id: "3",
    email: "finance@example.com",
    password: "finance123",
    role: "finance",
    name: "Finance",
  },
  {
    id: "4",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    name: "Admin",
  },
  {
    id: "5",
    email: "operation@example.com",
    password: "operation123",
    role: "operation",
    name: "Operation",
  },
  {
    id: "6",
    email: "driver@example.com",
    password: "driver123",
    role: "driver",
    name: "Driver",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    // Cari user berdasarkan email dan password
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verifikasi role jika diberikan
    if (role && user.role !== role) {
      return NextResponse.json(
        { error: "Role tidak sesuai" },
        { status: 403 }
      );
    }

    // Return user data tanpa password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      token: `mock-token-${user.id}-${Date.now()}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
