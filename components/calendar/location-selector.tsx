"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetLocations } from "@/hooks/api/useLocation";
import { useMonthYearState } from "@/hooks/useMonthYearState";

const LocationSelector = () => {
  const { locationId, setLocationId } = useMonthYearState();
  const { data: locations } = useGetLocations();

  const handleLocationChange = (value: string) => {
    const locationId = parseInt(value);
    setLocationId(locationId === 0 ? null : locationId);
  };

  return (
    <Select value={locationId?.toString() || "0"} onValueChange={handleLocationChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Location" />
      </SelectTrigger>
      <SelectContent>
        {locations?.data?.items?.map((location: any) => (
          <SelectItem key={location.id} value={location.id.toString()}>
            {location.location}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LocationSelector;
