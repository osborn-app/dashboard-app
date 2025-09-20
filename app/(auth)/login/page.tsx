"use client";

import { Metadata } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Crown, Car, DollarSign, Monitor, Wrench, User } from "lucide-react";

const roleIcons = {
  super_admin: Crown,
  owner: Car,
  finance: DollarSign,
  admin: Monitor,
  operation: Wrench,
  driver: User,
};

const roleNames = {
  super_admin: "SUPER ADMIN",
  owner: "OWNER",
  finance: "FINANCE",
  admin: "ADMIN",
  operation: "OPERATION",
  driver: "DRIVER",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    const role = searchParams.get("role");
    if (role) {
      setSelectedRole(role);
    } else {
      // Jika tidak ada role, redirect ke role selection
      router.push("/role-selection");
    }
  }, [searchParams, router]);

  const handleBack = () => {
    router.push("/role-selection");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email dan password harus diisi",
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        role: selectedRole,
        redirect: false,
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Login Gagal",
          description: "Email atau password salah",
        });
      } else {
        toast({
          title: "Login Berhasil",
          description: "Selamat datang di dashboard",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat login",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRole) {
    return <div>Loading...</div>;
  }

  const IconComponent = roleIcons[selectedRole as keyof typeof roleIcons];
  const roleName = roleNames[selectedRole as keyof typeof roleNames];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Blue Background */}
      <div className="w-2/5 bg-blue-600 flex flex-col justify-center items-center relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="absolute top-6 left-6 text-white hover:bg-blue-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 mx-auto">
            <IconComponent className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">SELAMAT DATANG,</h2>
          <h3 className="text-xl font-semibold">{roleName}</h3>
        </div>
      </div>

      {/* Right Panel - White Background */}
      <div className="w-3/5 bg-white flex flex-col justify-center items-center p-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
            LOGIN KE DASHBOARD
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Masukkan email..."
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                PASSWORD
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Masukkan password..."
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold uppercase"
            >
              {loading ? "Loading..." : "LOGIN"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
