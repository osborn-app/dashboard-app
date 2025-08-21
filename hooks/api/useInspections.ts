import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

// Get available fleets for inspection
export const useGetAvailableFleets = (type?: string, params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getAvailableFleetsFn = () => {
    return axiosAuth.get("/inspections/available", { params });
  };

  return useQuery({
    queryKey: ["available-fleets", type, params],
    queryFn: getAvailableFleetsFn,
    enabled: true, // Always enabled since we handle undefined type
  });
};

// Get inspections by status (only for pending_repair)
export const useGetInspectionsByStatus = (status: string, params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getInspectionsByStatusFn = () => {
    return axiosAuth.get(`/inspections/status/${status}`, { params });
  };

  return useQuery({
    queryKey: ["inspections", status, params],
    queryFn: getInspectionsByStatusFn,
    enabled: !!status,
  });
};

// Get completed inspections
export const useGetCompletedInspections = (params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getCompletedInspectionsFn = () => {
    return axiosAuth.get("/inspections/status/completed", { params });
  };

  return useQuery({
    queryKey: ["inspections", "completed", params],
    queryFn: getCompletedInspectionsFn,
  });
};

// Create inspection
export const useCreateInspection = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const createInspectionFn = (data: any) => {
    return axiosAuth.post("/inspections", data);
  };

  return useMutation({
    mutationFn: createInspectionFn,
    onSuccess: () => {
      // Invalidate all inspection queries
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      // Invalidate all available fleets queries
      queryClient.invalidateQueries({ queryKey: ["available-fleets"] });
    },
  });
};

// Get inspection detail
export const useGetInspectionDetail = (id: string | number) => {
  const axiosAuth = useAxiosAuth();

  const getInspectionDetailFn = () => {
    return axiosAuth.get(`/inspections/${id}`);
  };

  return useQuery({
    queryKey: ["inspections", id],
    queryFn: getInspectionDetailFn,
    enabled: !!id,
  });
};

// Complete inspection
export const useCompleteInspection = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const completeInspectionFn = (data: {
    fleetId: string | number;
    repairPhotoUrl?: string;
  }) => {
    const payload: any = {};

    if (data.repairPhotoUrl) {
      payload.repair_photo_url = data.repairPhotoUrl;
    }

    return axiosAuth.patch(
      `/inspections/fleets/${data.fleetId}/complete`,
      payload,
    );
  };

  return useMutation({
    mutationFn: completeInspectionFn,
    onSuccess: () => {
      // Invalidate all inspection queries
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      // Invalidate all available fleets queries
      queryClient.invalidateQueries({ queryKey: ["available-fleets"] });
    },
  });
};

export const useGetDailyReport = (params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getDailyReportFn = () => {
    return axiosAuth.get("/inspections/report/daily", { params });
  };

  return useQuery({
    queryKey: ["inspections", "daily", params],
    queryFn: getDailyReportFn,
  });
};

// Trigger report update
export const useTriggerReportUpdate = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const triggerReportUpdateFn = () => {
    return axiosAuth.get("/inspections/report/trigger");
  };

  return useMutation({
    mutationFn: triggerReportUpdateFn,
    onSuccess: () => {
      // Invalidate daily report query to refresh data
      queryClient.invalidateQueries({ queryKey: ["inspections", "daily"] });
      // Also invalidate other inspection queries if needed
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
    },
  });
};

//inspection muncul di owner tanpa table tersedia
export const useGetInspectionsByOwner = (params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getInspectionsByOwnerFn = () => {
    return axiosAuth.get(`/inspections/report/owner/me`, { params });
  };

  return useQuery({
    queryKey: ["inspections", "owner", params],
    queryFn: getInspectionsByOwnerFn,
  });
};
