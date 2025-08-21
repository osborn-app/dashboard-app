import React from "react";
import dayjs, { Dayjs } from "dayjs";

import Tooltip from "./tooltip";
import { ORDER_STATUS } from "./utils";
import { ICalendarData } from "./types";
import { useUser } from "@/context/UserContext";
import { useMonthYearState } from "@/hooks/useMonthYearState";

const DAY_WIDTH = 64;
const BOX_HEIGHT = 40;

const Grid = ({
  dates,
  data,
}: {
  dates: dayjs.Dayjs[];
  data: ICalendarData[];
}) => {
  const { user } = useUser();
  const { endpoint } = useMonthYearState();

  const today = dayjs().format("YYYY-MM-DD");

  const getDayOffset = (date: string) => {
    return dates.findIndex((d) => d.format("YYYY-MM-DD") === date);
  };

  const getTimeOffset = (startTime: Dayjs, endTime: Dayjs) => {
    const start = startTime;
    const end = endTime;
    const totalHours = end.diff(start, "hour", true);
    return totalHours;
  };

  const handleOrderClick = (orderStatus: string, orderId: string | number) => {
    let url: string;
    
    if (endpoint === "products") {
      // For products, always redirect to products-orders preview
      url = `/dashboard/product-orders/${orderId}/preview`;
    } else {
      // For fleets, use existing logic
      url = user?.role !== "owner" && ["pending", "waiting"].includes(orderStatus)
        ? `/dashboard/orders/${orderId}/preview`
        : `/dashboard/orders/${orderId}/detail`;
    }

    window.open(url);
  };

  const handleOffsets = (
    startOffset: number,
    endOffset: number,
    startTime: any,
    endTime: any,
    totalHours: number,
  ) => {
    if (startOffset === -1 && endOffset === -1) {
      return null;
    } else if (endOffset === -1) {
      const endOfMonth = startTime.endOf("month");
      const hoursInCurrentMonth = endOfMonth.diff(startTime, "hour", true);
      return (hoursInCurrentMonth / 24) * DAY_WIDTH;
    } else if (startOffset === -1) {
      startOffset = 0;
      const startOfMonth = endTime.startOf("month");
      const hoursInCurrentMonth = endTime.diff(startOfMonth, "hour", true);
      return (hoursInCurrentMonth / 24) * DAY_WIDTH;
    } else {
      return (totalHours / 24) * DAY_WIDTH;
    }
  };

  return (
    <>
      {data.map((vehicle, rowIndex) => (
        <div key={rowIndex} className="flex relative">
          {dates.map((date, colIndex) => {
            const isCurrentDate = date.format("YYYY-MM-DD") === today;
            const isLastRow = rowIndex === data.length - 1;
            const isLastColumn = colIndex === dates.length - 1;

            return (
              <div
                key={date.format("YYYY-MM-DD")}
                className={`relative border-gray-300 first:border-l-0 h-[64px] p-[12px] w-16 ${
                  isLastRow ? "border-b-0" : "border-b"
                } ${isCurrentDate ? "bg-neutral-50" : ""} ${
                  isLastColumn ? "border-r-0" : "border-r"
                }`}
                data-date={date.format("YYYY-MM-DD")}
              >
                {isCurrentDate && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-0.5 z-20 h-full bg-blue-600"></div>
                  </div>
                )}
              </div>
            );
          })}
          {vehicle.usage.map((usage, usageIndex: number) => {
            const startTime = usage.start;
            const endTime = usage.end;
            let startOffset = getDayOffset(startTime.format("YYYY-MM-DD"));
            const endOffset = getDayOffset(endTime.format("YYYY-MM-DD"));

            const totalHours = getTimeOffset(startTime, endTime);

            const width = handleOffsets(
              startOffset,
              endOffset,
              startTime,
              endTime,
              totalHours,
            );
            if (width === null) return;

            const leftPos =
              startOffset * DAY_WIDTH + (startTime.hour() / 24) * DAY_WIDTH;

            return (
              <div
                className={`absolute cursor-pointer rounded-lg ${ORDER_STATUS[
                  usage.orderStatus
                ]?.bgColor} ${ORDER_STATUS[usage.orderStatus]?.border} `}
                key={usageIndex}
                style={{
                  top: 12,
                  left: startOffset === -1 ? -8 : leftPos,
                  width: width,
                  height: BOX_HEIGHT,
                }}
              >
                <Tooltip type="date" data={usage}>
                  <div
                    className={`flex ${
                      width <= 20 ? "" : "px-[10px]"
                    } items-center justify-center h-full w-full`}
                    onClick={() =>
                      handleOrderClick(usage.orderStatus, usage.id)
                    }
                  >
                    <span
                      className={`truncate leading-5 font-medium text-[12px] ${ORDER_STATUS[
                        usage.orderStatus || "pending"
                      ]?.color}`}
                    >
                      {usage.title}
                    </span>
                  </div>
                </Tooltip>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
};

export default Grid;
