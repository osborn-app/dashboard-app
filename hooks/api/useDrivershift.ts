import {
    useMutation,
    useQuery,
  } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

const baseEndpoint = "/driver-shifts";

// Type definitions for API responses
export interface ApiMeta {
  total_items: number;
  item_count: number;
}

export interface ApiPagination {
  current_page: number;
  total_page: number;
  next_page: number | null;
}

export interface ApiResponse<T> {
  items: T[];
  meta: ApiMeta;
  pagination: ApiPagination;
}

export interface DriverShift {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  shifts: Array<{
    id: number | null;
    driver_id: number;
    shift_date: string;
    shift_type: string;
    location: {
      id: number;
      name: string;
    };
    location_id: number;
    custom_start_time: string;
    custom_end_time: string;
    notes: string;
    is_default: boolean;
    shift_label: string;
  }>;
}

export interface DriverShiftReport {
  driver_id: number;
  driver_name: string;
  driver_phone: string;
  total_pengantaran: number;
  total_penjemputan: number;
  total_dalam_jam_kerja: number;
  total_luar_jam_kerja: number;
  total_tasks: number;
  shifts_count: number;
}

export interface Location {
  id: number;
  name: string;
}

export const useGetDriverShifts = (params: any, options?: any) => {
    const axiosAuth = useAxiosAuth();

    const getDriverShifts = async (): Promise<ApiResponse<DriverShift>> => {
        const { data } = await axiosAuth.get(baseEndpoint, { params });
        return data;
    };

    return useQuery<ApiResponse<DriverShift>>({
        queryKey: ["driver-shifts", params],
        queryFn: getDriverShifts,
        ...options,
    });
};

export const useEditDriverShift = (id: string) => {
    const axiosAuth = useAxiosAuth();

    const editDriverShift = (data: any) => {
        return axiosAuth.patch(`${baseEndpoint}/${id}`, data);
    };

    return useMutation({
        mutationFn: editDriverShift,
    });
};

export const useGetDriverShiftReport = (params: any, options?: any) => {
    const axiosAuth = useAxiosAuth();

    const getDriverShiftReport = async (): Promise<ApiResponse<DriverShiftReport>> => {
        const { data } = await axiosAuth.get(`${baseEndpoint}/reports`,{ params });
        return data;
    };

    return useQuery<ApiResponse<DriverShiftReport>>({
        queryKey: ["driver-shift-report", params],
        queryFn: getDriverShiftReport,
        ...options,
    });
};

export const useGetDriverShiftLocations = (options?: any) => {
    const axiosAuth = useAxiosAuth();

    const getDriverShiftLocations = async (): Promise<Location[]> => {
        const { data } = await axiosAuth.get("/locations");
        return data;
    };

    return useQuery<Location[]>({
        queryKey: ["driver-shift-locations"],
        queryFn: getDriverShiftLocations,
        ...options,
    });
};