"use client";

import { Metadata } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
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
        const errorType = result.error;
        let title = "Login Gagal";
        let description = "Terjadi kesalahan saat login";

        switch (errorType) {
          case "ROLE_MISMATCH":
            title = "Role tidak sesuai";
            description = `Email ini bukan untuk role ${roleName}.`;
            break;
          case "INVALID_CREDENTIALS":
            title = "Kredensial tidak valid";
            description = "Email atau password salah. Silakan coba lagi.";
            break;
          case "USER_NOT_FOUND":
            title = "User tidak ditemukan";
            description = "Email tidak terdaftar dalam sistem.";
            break;
          case "SERVER_ERROR":
            title = "Server Error";
            description = "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
            break;
          case "NETWORK_ERROR":
            title = "Koneksi Error";
            description = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
            break;
          case "LOGIN_FAILED":
            title = "Login Gagal";
            description = "Gagal melakukan login. Silakan coba lagi.";
            break;
          default:
            title = "Login Gagal";
            description = "Email atau password salah";
        }

        console.log("Toast error:", { errorType, title, description });
        toast({
          variant: "destructive",
          title,
          description,
        });
      } else {
        toast({
          title: "Login Berhasil",
          description: "Selamat datang di dashboard",
        });
        
        // Redirect based on role
        const getDefaultRoute = (role: string) => {
          switch(role) {
            case "owner": return "/dashboard/calendar";
            case "finance": return "/dashboard/rekap-pencatatan";
            case "operation": return "/dashboard/inspections";
            case "driver": return "/dashboard/reimburse";
            case "admin": return "/dashboard";
            case "super_admin": return "/dashboard";
            default: return "/dashboard";
          }
        };
        
        router.push(getDefaultRoute(selectedRole || "admin"));
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
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-100 rounded-full opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 right-10 w-12 h-12 bg-blue-200 rounded-full opacity-40 animate-bounce delay-500"></div>
      </div>

             {/* Top Panel - Blue Background (Mobile) / Left Panel (Desktop) */}
             <div className="w-full md:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex flex-col justify-center items-center relative py-12 md:py-0 overflow-hidden">
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleBack}
                 className="absolute top-6 left-6 text-white hover:bg-blue-700/50 transition-all duration-300 z-10"
               >
                 <ArrowLeft className="w-5 h-5" />
               </Button>

               {/* Animated background patterns */}
               <div className="absolute inset-0 overflow-hidden">
                 <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
                 <div className="absolute top-1/4 -right-8 w-32 h-32 bg-white/5 rounded-full animate-bounce delay-1000"></div>
                 <div className="absolute bottom-1/4 -left-6 w-24 h-24 bg-white/8 rounded-full animate-pulse delay-2000"></div>
                 <div className="absolute -bottom-8 right-1/4 w-36 h-36 bg-white/6 rounded-full animate-bounce delay-500"></div>
               </div>

               <div className="text-center text-white relative z-10">
                 {/* Role Icon with enhanced styling */}
                 <div className="relative mb-6 md:mb-8">
                   <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto shadow-2xl animate-scale-in relative overflow-hidden">
                     {/* Icon glow effect */}
                     <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                     <IconComponent className="w-10 h-10 md:w-12 md:h-12 text-white relative z-10 drop-shadow-lg" />
                   </div>
                   {/* Decorative rings */}
                   <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 border-2 border-white/20 rounded-full mx-auto animate-spin-slow"></div>
                   <div className="absolute inset-2 w-16 h-16 md:w-20 md:h-20 border border-white/10 rounded-full mx-auto animate-spin-slow-reverse"></div>
                 </div>

                 {/* Welcome text with enhanced styling */}
                 <div className="space-y-2 md:space-y-3">
                   <h2 className="text-xl md:text-2xl font-bold mb-2 animate-slide-up bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
                     SELAMAT DATANG,
                   </h2>
                   <div className="relative">
                     <h3 className="text-lg md:text-xl font-semibold animate-slide-up-delay relative z-10">
                       {roleName}
                     </h3>
                     {/* Text underline effect */}
                     <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-white/60 animate-expand-width"></div>
                   </div>
                 </div>

                 {/* Role description */}
                 <p className="text-sm md:text-base text-blue-100 mt-4 md:mt-6 animate-fade-in-delay-2 max-w-xs mx-auto leading-relaxed">
                   {selectedRole === 'super_admin' && 'Akses penuh ke semua fitur sistem'}
                   {selectedRole === 'owner' && 'Kelola calendar, fleet, dan laporan'}
                   {selectedRole === 'finance' && 'Kelola keuangan dan reimburse'}
                   {selectedRole === 'admin' && 'Administrasi sistem lengkap'}
                   {selectedRole === 'operation' && 'Inspeksi dan perbaikan kendaraan'}
                   {selectedRole === 'driver' && 'Akses ke fitur reimburse'}
                 </p>
               </div>
             </div>

      {/* Bottom Panel - White Background (Mobile) / Right Panel (Desktop) */}
      <div className="w-full md:w-3/5 bg-gradient-to-br from-white via-blue-50/30 to-white flex flex-col justify-center items-center p-6 md:p-12 relative">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              LOGIN KE DASHBOARD
            </h1>
            <p className="text-gray-600">Masukkan kredensial Anda untuk melanjutkan</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6 animate-slide-up">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-blue-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 hover:border-blue-300"
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
                className="w-full border-blue-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 hover:border-blue-300"
                placeholder="Masukkan password..."
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold uppercase transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading...
                </div>
              ) : (
                "LOGIN"
              )}
            </Button>
          </form>
        </div>
      </div>

             <style jsx>{`
               @keyframes fade-in {
                 from { opacity: 0; transform: translateY(20px); }
                 to { opacity: 1; transform: translateY(0); }
               }

               @keyframes slide-up {
                 from { opacity: 0; transform: translateY(30px); }
                 to { opacity: 1; transform: translateY(0); }
               }

               @keyframes slide-up-delay {
                 from { opacity: 0; transform: translateY(30px); }
                 to { opacity: 1; transform: translateY(0); }
               }

               @keyframes scale-in {
                 from { opacity: 0; transform: scale(0.8); }
                 to { opacity: 1; transform: scale(1); }
               }

               @keyframes spin-slow {
                 from { transform: rotate(0deg); }
                 to { transform: rotate(360deg); }
               }

               @keyframes spin-slow-reverse {
                 from { transform: rotate(360deg); }
                 to { transform: rotate(0deg); }
               }

               @keyframes expand-width {
                 from { width: 0; }
                 to { width: 4rem; }
               }

               .animate-fade-in {
                 animation: fade-in 0.8s ease-out;
               }

               .animate-slide-up {
                 animation: slide-up 0.6s ease-out;
               }

               .animate-slide-up-delay {
                 animation: slide-up-delay 0.6s ease-out 0.2s both;
               }

               .animate-scale-in {
                 animation: scale-in 0.6s ease-out 0.4s both;
               }

               .animate-spin-slow {
                 animation: spin-slow 8s linear infinite;
               }

               .animate-spin-slow-reverse {
                 animation: spin-slow-reverse 6s linear infinite;
               }

               .animate-expand-width {
                 animation: expand-width 1s ease-out 0.8s both;
               }

               .animate-fade-in-delay-2 {
                 animation: fade-in 0.8s ease-out 0.6s both;
               }
             `}</style>
    </div>
  );
}
