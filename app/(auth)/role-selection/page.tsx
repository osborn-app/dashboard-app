"use client";

import { Metadata } from "next";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Car, DollarSign, Monitor, Wrench, User } from "lucide-react";

const roles = [
  {
    id: "super_admin",
    name: "SUPER ADMIN",
    description: "Akses penuh ke semua fitur",
    icon: Crown,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-600 to-blue-800",
    borderColor: "border-blue-300",
    shadowColor: "shadow-blue-200",
  },
  {
    id: "owner",
    name: "OWNER",
    description: "Akses ke calendar, fleets, recap",
    icon: Car,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-500 to-blue-700",
    borderColor: "border-blue-300",
    shadowColor: "shadow-blue-200",
  },
  {
    id: "finance",
    name: "FINANCE",
    description: "Akses ke fitur keuangan",
    icon: DollarSign,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
    borderColor: "border-blue-300",
    shadowColor: "shadow-blue-200",
  },
  {
    id: "admin",
    name: "ADMIN",
    description: "Akses administrasi penuh",
    icon: Monitor,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-500 to-blue-700",
    borderColor: "border-blue-300",
    shadowColor: "shadow-blue-200",
  },
  {
    id: "operation",
    name: "OPERATION",
    description: "Akses ke inspeksi & perbaikan",
    icon: Wrench,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
    borderColor: "border-blue-300",
    shadowColor: "shadow-blue-200",
  },
  {
    id: "driver",
    name: "DRIVER",
    description: "Akses ke reimburse",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-500 to-blue-700",
    borderColor: "border-blue-300",
    shadowColor: "shadow-blue-200",
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();

  const handleRoleSelect = (roleId: string) => {
    // Simpan role yang dipilih ke localStorage
    localStorage.setItem("selectedRole", roleId);
    // Langsung redirect ke login
    router.push(`/login?role=${roleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-blue-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-blue-200 rounded-full opacity-30 animate-bounce delay-500"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 uppercase animate-fade-in">
            PILIH ROLE UNTUK MELANJUTKAN KE DASHBOARD
          </h1>
          <p className="text-gray-600 text-lg animate-fade-in-delay">Pilih peran Anda untuk mengakses dashboard yang sesuai</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {roles.map((role, index) => {
            const IconComponent = role.icon;
            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 ${role.borderColor} border-2 overflow-hidden group animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[160px] relative bg-white">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 ${role.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  {/* Icon with enhanced styling */}
                  <div className={`w-16 h-16 rounded-full ${role.bgColor} flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <IconComponent className={`w-8 h-8 text-white transition-transform duration-300 group-hover:rotate-12`} />
                  </div>
                  
                  {/* Role name */}
                  <h3 className={`font-bold text-lg uppercase ${role.color} group-hover:text-blue-700 transition-colors duration-300 mb-1 text-center`}>
                    {role.name}
                  </h3>
                  
                  {/* Role description */}
                  <p className="text-xs text-gray-600 text-center leading-tight group-hover:text-gray-700 transition-colors duration-300">
                    {role.description}
                  </p>
                  
                  {/* Hover effect indicator */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 0.8s ease-out 0.3s both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
}
