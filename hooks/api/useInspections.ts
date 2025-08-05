import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

// Get available fleets for inspection
export const useGetAvailableFleets = (type?: string, params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getAvailableFleetsFn = () => {
    const queryParams = new URLSearchParams();

    if (type) {
      queryParams.append("type", type);
    }

    if (params?.q) {
      queryParams.append("q", params.q);
    }

    const queryString = queryParams.toString();
    const url = `/inspections/available${queryString ? `?${queryString}` : ""}`;

    return axiosAuth.get(url);
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
    return axiosAuth.get("/inspections", { params });
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

  const completeInspectionFn = (fleetId: string | number) => {
    return axiosAuth.patch(`/inspections/fleets/${fleetId}/complete`);
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
