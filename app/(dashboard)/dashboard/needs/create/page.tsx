"use client";
import BreadCrumb from "@/components/breadcrumb";
import NeedsForm from "@/components/forms/needs-form";
import React, { useState } from "react";
import { createMaintenance } from "@/client/needsClient";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

type MaintenanceFormData = {
  fleet_id: number;
  description: string;
  start_date: string;
  estimate_days: number;
};

export default function Page() {
  const { data: session } = useSession();
  const router = useRouter();
  const breadcrumbItems = [
    { title: "Maintenance", link: "/dashboard/needs" },
    { title: "Create", link: "/dashboard/needs/create" },
  ];

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: MaintenanceFormData) => {
    const token = session?.user?.accessToken;
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Token tidak ditemukan. Silakan login ulang.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }
    
    setLoading(true);
    try {
      await createMaintenance(formData, token);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Maintenance berhasil dibuat!",
        confirmButtonColor: "#10b981",
      }).then(() => {
        router.push("/dashboard/needs");
      });
    } catch (err: any) {
      let errorMessage = "Gagal membuat maintenance. Silakan coba lagi.";
      let errorDetails = "";
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        // Handle conflicts and reschedule suggestion
        if (err.response.data.conflicts && err.response.data.reschedule_suggestion) {
          const conflicts = err.response.data.conflicts;
          const suggestion = err.response.data.reschedule_suggestion;
          
          errorDetails = `
            <div class="text-left mt-3">
              <p class="font-semibold mb-2">Konflik dengan pesanan:</p>
              ${conflicts.map((conflict: any) => `
                <div class="bg-gray-100 p-2 rounded mb-2">
                  <p><strong>Invoice:</strong> ${conflict.invoice_number}</p>
                  <p><strong>Tanggal:</strong> ${new Date(conflict.start_date).toLocaleDateString('id-ID')} - ${new Date(conflict.end_date).toLocaleDateString('id-ID')}</p>
                </div>
              `).join('')}
              
              <p class="font-semibold mt-3 mb-2">Saran jadwal baru:</p>
              <div class="bg-green-100 p-2 rounded">
                <p><strong>Mulai:</strong> ${new Date(suggestion.start_date).toLocaleDateString('id-ID')}</p>
                <p><strong>Selesai:</strong> ${new Date(suggestion.end_date).toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          `;
        }
      }
      
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        html: errorMessage + errorDetails,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <NeedsForm onSubmit={handleSubmit} />
      )}
    </div>
  );
}
