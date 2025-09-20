"use client";

import { Metadata } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Car, DollarSign, Monitor, Wrench, User } from "lucide-react";

const roles = [
  {
    id: "super_admin",
    name: "SUPER ADMIN",
    icon: Crown,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "owner",
    name: "OWNER",
    icon: Car,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "finance",
    name: "FINANCE",
    icon: DollarSign,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "admin",
    name: "ADMIN",
    icon: Monitor,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "operation",
    name: "OPERATION",
    icon: Wrench,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "driver",
    name: "DRIVER",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    // Simpan role yang dipilih ke localStorage
    localStorage.setItem("selectedRole", roleId);
  };

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/login?role=${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-12 uppercase">
          PILIH ROLE UNTUK MELANJUTKAN KE DASHBOARD
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedRole === role.id
                    ? "ring-2 ring-blue-500 bg-blue-100"
                    : "hover:bg-blue-50"
                } ${role.borderColor} border-2`}
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[120px]">
                  <div className={`w-16 h-16 rounded-full border-2 border-blue-600 flex items-center justify-center mb-4 ${role.bgColor}`}>
                    <IconComponent className={`w-8 h-8 ${role.color}`} />
                  </div>
                  <span className={`font-bold text-sm uppercase ${role.color}`}>
                    {role.name}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold uppercase"
          >
            Lanjutkan
          </Button>
        </div>
      </div>
    </div>
  );
}
