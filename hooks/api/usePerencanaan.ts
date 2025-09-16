import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

// ===== PLANNING PLANS API =====
const baseEndpoint = "/planning";

interface GetPerencanaanParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  order_by?: string;
  order_column?: string;
}

export const useGetPerencanaan = (params?: GetPerencanaanParams) => {
  const axiosAuth = useAxiosAuth();

  const getPerencanaan = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/plans`, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["perencanaan", params],
    queryFn: getPerencanaan,
  });
};

export const useGetDetailPerencanaan = (id: number | string) => {
  const axiosAuth = useAxiosAuth();

  const getDetailPerencanaan = () => {
    return axiosAuth.get(`${baseEndpoint}/plans/${id}`);
  };

  return useQuery({
    queryKey: ["perencanaan", id],
    queryFn: getDetailPerencanaan,
  });
};

export const usePostPerencanaan = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const postPerencanaan = (body: any) => {
    return axiosAuth.post(`${baseEndpoint}/plans`, body);
  };

  return useMutation({
    mutationFn: postPerencanaan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perencanaan"] });
    },
  });
};

export const useEditPerencanaan = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const editPerencanaan = (body: any) => {
    return axiosAuth.patch(`${baseEndpoint}/plans/${id}`, body);
  };

  return useMutation({
    mutationFn: editPerencanaan,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["perencanaan"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perencanaan"] });
    },
  });
};

export const useDeletePerencanaan = (id: number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deletePerencanaan = (id: number) => {
    return axiosAuth.delete(`${baseEndpoint}/plans/${id}`);
  };

  return useMutation({
    mutationFn: deletePerencanaan,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["perencanaan"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perencanaan"] });
    },
  });
};

// ===== PLANNING ENTRIES API =====
export const useGetPlanningEntries = (planningId: string | number, params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getPlanningEntries = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/${planningId}/entries`, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["planning-entries", planningId, params],
    queryFn: getPlanningEntries,
  });
};

export const useCreatePlanningEntry = (planningId: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const createPlanningEntry = (body: any) => {
    return axiosAuth.post(`${baseEndpoint}/${planningId}/entries`, body);
  };

  return useMutation({
    mutationFn: createPlanningEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning-entries", planningId] });
    },
  });
};

export const useUpdatePlanningEntry = (planningId: string | number, entryId: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updatePlanningEntry = (body: any) => {
    return axiosAuth.patch(`${baseEndpoint}/${planningId}/entries/${entryId}`, body);
  };

  return useMutation({
    mutationFn: updatePlanningEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning-entries", planningId] });
    },
  });
};

export const useDeletePlanningEntry = (planningId: string | number, entryId: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deletePlanningEntry = () => {
    return axiosAuth.delete(`${baseEndpoint}/${planningId}/entries/${entryId}`);
  };

  return useMutation({
    mutationFn: deletePlanningEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning-entries", planningId] });
    },
  });
};

// ===== PLANNING ACCOUNTS API =====
export const useGetPlanningAccounts = (params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getPlanningAccounts = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/accounts`, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["planning-accounts", params],
    queryFn: getPlanningAccounts,
  });
};

// ===== PLANNING REPORTS API =====
export const useGetLabaRugiReport = (params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getLabaRugiReport = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/reports/laba-rugi`, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["laba-rugi-report", params],
    queryFn: getLabaRugiReport,
  });
};

export const useGetNeracaReport = (params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getNeracaReport = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/reports/neraca`, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["neraca-report", params],
    queryFn: getNeracaReport,
  });
};

export const useGetArusKasReport = (params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getArusKasReport = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/reports/arus-kas`, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["arus-kas-report", params],
    queryFn: getArusKasReport,
  });
};
