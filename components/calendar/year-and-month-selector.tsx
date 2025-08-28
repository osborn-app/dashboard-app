"use client";
import React from "react";

import DateRangeSelector from "./date-range-selector";
import MonthSelector from "./month-selector";
import YearSelector from "./year-selector";
import InputSearch from "./input-search";
import InputType from "./input-type";
import EndpointSelector from "./endpoint-selector";
import LocationSelector from "./location-selector";
import { useMonthYearState } from "@/hooks/useMonthYearState";

const YearAndMonthSelector = ({
  withDateRange = false,
  withSearch = false,
  withType = false,
  withEndpointSelector = false,
  withLocationSelector = false,
}) => {
  const { endpoint } = useMonthYearState();
  
  return (
    <div className="flex items-center gap-[10px]">
      {withSearch && <InputSearch />}
      {withDateRange && <DateRangeSelector />}
      {withEndpointSelector && <EndpointSelector />}
      {withType && <InputType />}
      {withLocationSelector && endpoint === "fleets" && <LocationSelector />}
      <MonthSelector />
      <YearSelector />
    </div>
  );
};

export default YearAndMonthSelector;
