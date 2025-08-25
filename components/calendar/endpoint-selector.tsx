'use client'
import React from "react";

import { useMonthYearState } from "@/hooks/useMonthYearState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useUser } from "@/context/UserContext";

const EndpointSelector = () => {
  const { endpoint, setEndpoint } = useMonthYearState();
  const { user } = useUser();

  // Hide endpoint selector for owner role
  if (user?.role === "owner") {
    return null;
  }

  const endpoints = [
    { id: "fleets", name: "Kendaraan" },
    { id: "products", name: "Produk" },
    { id: "inspections", name: "Inspeksi" },
    { id: "maintenance", name: "Maintenance" },
  ];

  const handleEndpointChange = (value: "fleets" | "products" | "inspections" | "maintenance") => {
    setEndpoint(value);
  };

  return (
    <Select
      onValueChange={handleEndpointChange}
      value={endpoint}
      defaultValue={endpoint}
    >
      <SelectTrigger>
        <SelectValue
          defaultValue={endpoint}
          placeholder="Pilih kategori"
        />
      </SelectTrigger>
      <SelectContent>
        {endpoints.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default EndpointSelector;
