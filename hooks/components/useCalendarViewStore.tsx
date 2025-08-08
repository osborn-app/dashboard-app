import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { useGetCalendar } from "@/hooks/api/useCalendar";
import { formatRupiah } from "@/lib/utils";
import { ICalendarData } from "@/components/calendar/types";

dayjs.extend(utc);
dayjs.extend(timezone);

const useCalendarViewStore = (filter?: any) => {
  const {
    data: calendar,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetCalendar({
    limit: 5,
    ...filter,
  });

  const data = calendar?.pages?.flatMap((page) => page?.data?.items || []) || [];

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
