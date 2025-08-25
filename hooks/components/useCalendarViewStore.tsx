import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { useGetCalendar } from "@/hooks/api/useCalendar";
import { formatRupiah } from "@/lib/utils";
import { ICalendarData } from "@/components/calendar/types";
import { useMonthYearState } from "@/hooks/useMonthYearState";

dayjs.extend(utc);
dayjs.extend(timezone);

// Map backend order status to frontend order status
const mapOrderStatus = (backendStatus: string) => {
  const statusMap: Record<string, string> = {
    'accepted': 'on_going',
    'pending': 'pending',
    'rejected': 'cancelled',
  };
  return statusMap[backendStatus] || backendStatus;
};

const useCalendarViewStore = (filter?: any) => {
  const { endpoint } = useMonthYearState();
  
  const {
    data: calendar,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetCalendar({
    limit: 5,
    endpoint,
    ...(endpoint === "inspections" && filter?.type ? { status: filter.type } : {}),
    ...(endpoint === "maintenance" && filter?.type ? { status: filter.type } : {}),
    ...(endpoint !== "inspections" && endpoint !== "maintenance" ? filter : {}),
  });

  // Handle different data structures for different endpoints
  let data;
  if (endpoint === "inspections") {
    data = calendar?.pages?.flatMap((page) => page?.data?.data || []) || [];
  } else if (endpoint === "maintenance") {
    data = calendar?.pages?.flatMap((page) => page?.data?.items || []) || [];
  } else {
    data = calendar?.pages?.flatMap((page) => page?.data?.items || []) || [];
  }

  let mappedData: ICalendarData[] = [];

  try {
    mappedData = data?.map((item) => {
      if (!item) {
        return {
          id: "",
          name: "",
          location: "",
          price: "",
          image: "",
          usage: [],
        };
      }

      if (endpoint === "inspections") {
        return {
          id: item?.id || "",
          name: item?.fleet?.name || "",
          location: item?.fleet?.location?.location || "",
          price: item?.fleet?.price ? formatRupiah(item.fleet.price) : "",
          image: item?.fleet?.photo?.photo || "",
          usage: [{
            id: item?.id || "",
            start: item?.inspection_date ? dayjs(item.inspection_date).tz("Asia/Jakarta") : dayjs(),
            end: item?.repair_completion_date ? dayjs(item.repair_completion_date).tz("Asia/Jakarta") : dayjs(),
            startDriver: item?.inspector_name || "-",
            endDriver: item?.inspector_name || "-",
            duration: (item?.repair_duration_days || 0) + " hari",
            paymentStatus: "",
            orderStatus: item?.status || "",
            title: `Inspeksi - ${item?.fleet?.plate_number || ""}`,
            price: "Rp 0",
          }],
        };
      } else if (endpoint === "maintenance") {
        return {
          id: item?.id || "",
          name: item?.fleet?.name || "",
          location: item?.fleet?.location?.location || "",
          price: item?.fleet?.price ? formatRupiah(item.fleet.price) : "",
          image: item?.fleet?.photo?.photo || "",
          usage: [{
            id: item?.id || "",
            start: item?.start_date ? dayjs(item.start_date).tz("Asia/Jakarta") : dayjs(),
            end: item?.end_date ? dayjs(item.end_date).tz("Asia/Jakarta") : dayjs(),
            startDriver: "-",
            endDriver: "-",
            duration: (item?.estimate_days || 0) + " hari",
            paymentStatus: "",
            orderStatus: item?.status || "",
            title: `${item?.name || "Maintenance"} - ${item?.fleet?.plate_number || ""}`,
            price: "Rp 0",
          }],
        };
      } else {
        // Original logic for fleets and products
        return {
          id: item?.id || "",
          name: item?.name || "",
          location: item?.location?.location || "",
          price: item?.price ? formatRupiah(item.price) : "",
          image: item?.photo?.photo || "",
          usage: item?.orders?.map((order: any) => {
            if (!order) {
              return {
                id: "",
                start: dayjs(),
                end: dayjs(),
                startDriver: "-",
                endDriver: "-",
                duration: "0 hari",
                paymentStatus: "",
                orderStatus: "",
                title: "-",
                price: "Rp 0",
              };
            }

            return {
              id: order?.id || "",
              start: order?.start_date ? dayjs(order.start_date).tz("Asia/Jakarta") : dayjs(),
              end: order?.end_date ? dayjs(order.end_date).tz("Asia/Jakarta") : dayjs(),
              startDriver: order?.start_request?.driver?.name || "-",
              endDriver: order?.end_request?.driver?.name || "-",
              duration: (order?.duration || 0) + " hari",
              paymentStatus: order?.payment_status || "",
              orderStatus: order?.order_status || "",
              title: order?.customer?.name || "-",
              price: order?.total_price ? formatRupiah(order.total_price) : "Rp 0",
            };
          }) || [],
        };
      }
    }) || [];
  } catch (error) {
    console.error("Error mapping calendar data:", error);
    mappedData = [];
  }

  if (!isFetching && mappedData.length < 5) {
    const emptyDataCount = 5;
    for (let i = 0; i < emptyDataCount; i++) {
      mappedData.push({
        id: "",
        name: "",
        location: "",
        price: "",
        image: "",
        usage: [],
      });
    }
  }

  return {
    calendarData: mappedData,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
};

export default useCalendarViewStore;
