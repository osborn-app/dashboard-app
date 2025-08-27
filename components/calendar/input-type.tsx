'use client'
import React from "react";

import { useMonthYearState } from "@/hooks/useMonthYearState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const InputType = () => {
  const { typeQuery, setTypeQuery, endpoint } = useMonthYearState();

  const fleetTypes = [
    { id: "", name: "Semua Kendaraan" },
    { id: "motorcycle", name: "Motor" },
    { id: "car", name: "Mobil" },
  ];

  const productCategories = [
    { id: "", name: "Semua Produk" },
    { id: "iphone", name: "iPhone" },
    { id: "camera", name: "Kamera" },
    { id: "outdoor", name: "Outdoor" },
    { id: "starlink", name: "Starlink" },
  ];

  const inspectionStatuses = [
    { id: "", name: "Semua Status" },
    { id: "pending_repair", name: "Pending Repair" },
    { id: "completed", name: "Completed" },
  ];

  const maintenanceStatuses = [
    { id: "", name: "Semua Status" },
    { id: "ongoing", name: "Ongoing" },
    { id: "done", name: "Done" },
  ];

  let options;
  let placeholder;

  if (endpoint === "fleets") {
    options = fleetTypes;
    placeholder = "Pilih tipe kendaraan";
  } else if (endpoint === "products") {
    options = productCategories;
    placeholder = "Pilih kategori produk";
  } else if (endpoint === "inspections") {
    options = inspectionStatuses;
    placeholder = "Pilih status inspeksi";
  } else if (endpoint === "maintenance") {
    options = maintenanceStatuses;
    placeholder = "Pilih status maintenance";
  } else {
    options = fleetTypes;
    placeholder = "Pilih tipe kendaraan";
  }

  const handleTypeInputChange = (
    value: string,
  ) => {
    setTypeQuery(value);
  };

  return (
    <Select
      onValueChange={handleTypeInputChange}
      value={typeQuery}
      defaultValue={typeQuery}
    >
      <SelectTrigger>
        <SelectValue
          defaultValue={typeQuery}
          placeholder={placeholder}
        />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default InputType;
