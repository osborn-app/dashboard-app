import { useInfiniteQuery } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";
import { compact } from "lodash";

type CalendarEndpoint = "fleets" | "products";

export const useGetCalendar = (params?: Record<string, any> & { endpoint?: CalendarEndpoint }) => {
  const axiosAuth = useAxiosAuth();
  const { endpoint = "fleets", ...restParams } = params || {};

  const getCalendar = (pageParam = "1") => {
    return axiosAuth.get(`/${endpoint}/calendar`, {
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
    getNextPageParam: (lastPage) => lastPage.data.pagination?.next_page,
  });
};
