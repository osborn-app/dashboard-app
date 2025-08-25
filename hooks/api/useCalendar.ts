import { useInfiniteQuery } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";
import { compact } from "lodash";

type CalendarEndpoint = "fleets" | "products" | "inspections" | "maintenance";

export const useGetCalendar = (params?: Record<string, any> & { endpoint?: CalendarEndpoint }) => {
  const axiosAuth = useAxiosAuth();
  const { endpoint = "fleets", ...restParams } = params || {};

  const getCalendar = (pageParam = "1") => {
    let url;
    if (endpoint === "inspections") {
      url = "/inspections";
    } else if (endpoint === "maintenance") {
      url = "/maintenance";
    } else {
      url = `/${endpoint}/calendar`;
    }
    
    return axiosAuth.get(url, {
      params: {
        ...restParams,
        page: pageParam,
      },
    });
  };

  return useInfiniteQuery({
    queryKey: compact([endpoint, "calendar", restParams]),
    queryFn: ({ pageParam }) => getCalendar(pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (endpoint === "inspections") {
        return lastPage.data.totalPages > lastPage.data.page ? lastPage.data.page + 1 : undefined;
      } else if (endpoint === "maintenance") {
        return lastPage.data.pagination?.next_page;
      } else {
        return lastPage.data.pagination?.next_page;
      }
    },
  });
};
