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

  const options = endpoint === "fleets" ? fleetTypes : productCategories;
  const placeholder = endpoint === "fleets" ? "Pilih tipe kendaraan" : "Pilih kategori produk";

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
