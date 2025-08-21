"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

import useCalendarViewStore from "@/hooks/components/useCalendarViewStore";

import LeftColumn from "./left-column";
import Header from "./header";
import Grid from "./grid";
import { useMonthYearState } from "@/hooks/useMonthYearState";
import { Skeleton } from "../ui/skeleton";

const Calendar = () => {
  const { month, year, typeQuery, endpoint } = useMonthYearState();
  const [pageParam, setPageParam] = useState("1");

  const {
    calendarData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
  } = useCalendarViewStore({
    month: month.toString(),
    year: year.toString(),
    ...(typeQuery && { type: typeQuery }),
    page: pageParam,
  });

  useEffect(() => {
    setPageParam("1");
  }, [month, year, typeQuery, endpoint]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage],
  );
  const now = dayjs(`${year}-${month}-01`);
  const start = now.startOf("month");
  const end = now.endOf("month");

  const dates: Dayjs[] = [];
  const today = dayjs().format("YYYY-MM-DD");

  for (
    let date = start;
    date.isBefore(end) || date.isSame(end, "day");
    date = date.add(1, "day")
  ) {
    dates.push(date);
  }

  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const todayColumn = document.querySelector(
      `[data-date='${today}']`,
    ) as HTMLElement;
    if (todayColumn && tableRef.current) {
      const offsetLeft = todayColumn.offsetLeft;
      const containerWidth = tableRef.current.offsetWidth;
      tableRef.current.scrollLeft =
        offsetLeft - containerWidth / 2 + todayColumn.offsetWidth / 2;
    }
  }, [today]);

  return (
    <div
      className="border overflow-auto border-neutral-200 rounded-lg max-h-[calc(100vh-200px)]"
      ref={tableRef}
    >
      <div className="flex max-h-max">
        <LeftColumn vehicles={calendarData} isFetching={isFetching} />

        <div className="flex-1">
          <Header dates={dates} />
          <Grid dates={dates} data={calendarData} />
          {isFetching && (
            <div className="flex flex-col space-y-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex flex-row gap-[2px]">
                  {dates.map((date) => (
                    <Skeleton
                      key={date.format("YYYY-MM-DD")}
                      className="h-[40px] w-[62px] rounded-md"
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
          <div ref={lastItemRef} className="h-1" />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
