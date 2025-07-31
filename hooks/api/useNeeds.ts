
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMaintenance,
  getMaintenances,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
  markMaintenanceDone,
  manualCheckMaintenanceStatus,
  getMaintenancesByFleetId,
} from "@/client/needsClient";


export const useGetMaintenances = (params: any, token: string) =>
  useQuery({
    queryKey: ["maintenances", params],
    queryFn: () => getMaintenances(params, token).then(res => res.data),
  });


export const useGetMaintenanceById = (id: number, token: string) =>
  useQuery({
    queryKey: ["maintenance", id],
    queryFn: () => getMaintenanceById(id, token).then(res => res.data),
  });


export const useCreateMaintenance = (token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createMaintenance(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
};


export const useUpdateMaintenance = (id: number, token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => updateMaintenance(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
};


export const useDeleteMaintenance = (id: number, token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteMaintenance(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
};

export const useMarkMaintenanceDone = (id: number, token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markMaintenanceDone(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
};

export const useManualCheckMaintenanceStatus = (token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => manualCheckMaintenanceStatus(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
};

export const useGetMaintenancesByFleetId = (fleetId: number, token: string) =>
  useQuery({
    queryKey: ["maintenances", "fleet", fleetId],
    queryFn: () => getMaintenancesByFleetId(fleetId, token).then(res => res.data),
  });