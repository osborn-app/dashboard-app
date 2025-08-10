"use client";
import BreadCrumb from "@/components/breadcrumb";
import NeedsForm from "@/components/forms/needs-form";
import React, { useState } from "react";
import { createMaintenance } from "@/client/needsClient";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";



type MaintenanceFormData = {
  fleet_id: number;
  description: string;
  start_date: string;
  estimate_days: number;
};

export default function Page() {
  const { data: session } = useSession();
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
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Gagal membuat maintenance. Silakan coba lagi.",
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
