"use client";
import BreadCrumb from "@/components/breadcrumb";
import NeedsForm from "@/components/forms/needs-form";
import React, { useEffect, useState } from "react";
import { createMaintenance } from "@/client/needsClient";
import { getFleets } from "@/client/fleetClient";

type Fleet = { id: number; name: string; status: string };
type MaintenanceFormData = {
  fleet_id: number;
  description: string;
  start_date: string;
  estimate_days: number;
};

export default function Page() {
  const breadcrumbItems = [
    { title: "needs", link: "/dashboard/needs" },
    { title: "Create", link: "/dashboard/needs/create" },
  ];

  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil JWT token dari localStorage
  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token_jwt") : null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
  getFleets(token)
    .then((res: { data: Fleet[] }) => {
      setFleets(res.data);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (formData: MaintenanceFormData) => {
    const token = getToken();
    if (!token) {
      alert("Token JWT tidak ditemukan. Silakan login ulang.");
      return;
    }
    try {
      await createMaintenance(formData, token);
      // tampilkan pesan sukses atau redirect
      alert("Maintenance berhasil dibuat!");
    } catch (err) {
      alert("Gagal membuat maintenance. Silakan coba lagi.");
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
