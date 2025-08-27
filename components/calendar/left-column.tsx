import React from "react";

import LeftColumnItem from "./left-column-item";
import { Skeleton } from "../ui/skeleton";
import { useMonthYearState } from "@/hooks/useMonthYearState";

import { ICalendarData } from "./types";

const LeftColumn = ({
  vehicles,
  isFetching,
}: {
  vehicles: ICalendarData[];
  isFetching: boolean;
}) => {
  const { endpoint } = useMonthYearState();
  
  const headerText = endpoint === "products" ? "Nama Produk" : "Nama Kendaraan";
  
  return (
    <div className="left-0 sticky z-50 bg-white">
      <div className="sticky left-0 bg-white w-[324px]">
        <div className="top-0 sticky border-b border-r border-neutral-200 h-[50px] flex w-full bg-white z-[3]">
          <p className="flex items-center py-[12px] px-[20px] text-neutral-700 font-medium text-[14px] leading-6">
            {headerText}
          </p>
        </div>

        {vehicles.map((vehicle, index) => (
          <LeftColumnItem
            key={index}
            vehicle={vehicle}
            isLast={index === vehicles.length - 1}
          />
        ))}

        {isFetching && (
          <div className="flex flex-col space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="h-[40px] w-[calc(100%-2px)] rounded-md"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftColumn;
