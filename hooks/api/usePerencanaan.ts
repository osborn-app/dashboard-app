import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

// ===== BASE ENDPOINT =====
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

// ===== GET Perencanaan =====
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

// ===== GET Detail Perencanaan =====
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

// ===== POST Perencanaan =====
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

// ===== EDIT Perencanaan =====
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

// ===== DELETE Perencanaan =====
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
// ===== GET Planning Entries =====
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

// ===== CREATE Planning Entry =====
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

// ===== UPDATE Planning Entry =====
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

// ===== DELETE Planning Entry =====
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
// ===== GET Planning Accounts =====
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
// ===== GET Laba Rugi Report =====
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

// ===== GET Neraca Report =====
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

// ===== GET Arus Kas Report =====
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

// ===== PLANNING CATEGORIES API =====

// ===== POST Planning Categories =====
export const usePostPlanningCategories = (body: any) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const postPlanningCategories = async () => {
    const { data } = await axiosAuth.post(`${baseEndpoint}/categories`, body);
    return data;
  };

  return useMutation({
    mutationFn: postPlanningCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning-categories"] });
    },
  });
};

// ===== GET Planning Categories =====
export const useGetPlanningCategories = (params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getPlanningCategories = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/categories`, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["planning-categories", params],
    queryFn: getPlanningCategories,
  });
};

// ===== GET Planning Categories Select =====
export const useGetPlanningCategoriesSelect = () => {
  const axiosAuth = useAxiosAuth();

  const getPlanningCategoriesSelect = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/categories/select`);
    return data;
  };

  return useQuery({
    queryKey: ["planning-categories-select"],
    queryFn: getPlanningCategoriesSelect,
  });
};

// ===== GET Planning Categories Statistics =====
export const useGetPlanningCategoriesStatistics = () => {
  const axiosAuth = useAxiosAuth();

  const getPlanningCategoriesStatistics = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/categories/statistics`);
    return data;
  };

  return useQuery({
    queryKey: ["planning-categories-statistics"],
    queryFn: getPlanningCategoriesStatistics,
  });
};

// ===== GET Planning Category Detail =====
export const useGetPlanningCategoryDetail = (id: number | string) => {
  const axiosAuth = useAxiosAuth();

  const getPlanningCategoryDetail = () => {
    return axiosAuth.get(`${baseEndpoint}/categories/${id}`);
  };

  return useQuery({
    queryKey: ["planning-category", id],
    queryFn: getPlanningCategoryDetail,
  });
};

// ===== UPDATE Planning Category =====
export const useUpdatePlanningCategory = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updatePlanningCategory = (body: any) => {
    return axiosAuth.put(`${baseEndpoint}/categories/${id}`, body);
  };

  return useMutation({
    mutationFn: updatePlanningCategory,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["planning-categories"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning-categories"] });
    },
  });
};

// ===== DELETE Planning Category =====
export const useDeletePlanningCategory = (id: number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deletePlanningCategory = (id: number) => {
    return axiosAuth.delete(`${baseEndpoint}/categories/${id}`);
  };

  return useMutation({
    mutationFn: deletePlanningCategory,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["planning-categories"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning-categories"] });
    },
  });
};

// ===== GET Planning Category Entries =====
export const useGetPlanningCategoryEntries = (id: number | string, params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getPlanningCategoryEntries = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/categories/${id}/entries`, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["planning-category-entries", id, params],
    queryFn: getPlanningCategoryEntries,
  });
};

// ===== ASSIGN Entries to Category =====
export const useAssignEntriesToCategory = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const assignEntriesToCategory = (body: any) => {
    return axiosAuth.post(`${baseEndpoint}/categories/${id}/assign`, body);
  };

  return useMutation({
    mutationFn: assignEntriesToCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning-categories"] });
      queryClient.invalidateQueries({ queryKey: ["planning-category-entries", id] });
    },
  });
};

// ===== BULK UPDATE Category =====
export const useBulkUpdateCategory = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const bulkUpdateCategory = (body: any) => {
    return axiosAuth.put(`${baseEndpoint}/categories/bulk-update`, body);
  };

  return useMutation({
    mutationFn: bulkUpdateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning-categories"] });
    },
  });
};

// ===== REMOVE Category from Entries =====
export const useRemoveCategoryFromEntries = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const removeCategoryFromEntries = (body: { entry_ids: number[] }) => {
    return axiosAuth.delete(`${baseEndpoint}/categories/remove`, { data: body });
  };

  return useMutation({
    mutationFn: removeCategoryFromEntries,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning-categories"] });
    },
  });
};

// ===== GET Planning Category Accounts =====
export const useGetPlanningCategoryAccounts = (id: number | string, params?: any) => {
  const axiosAuth = useAxiosAuth();

  const getPlanningCategoryAccounts = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/categories/${id}/accounts`, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["planning-category-accounts", id, params],
    queryFn: getPlanningCategoryAccounts,
  });
};

// ===== ASSIGN Accounts to Category =====
export const useAssignAccountsToCategory = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const assignAccountsToCategory = (body: any) => {
    return axiosAuth.post(`${baseEndpoint}/categories/${id}/assign-accounts`, body);
  };

  return useMutation({
    mutationFn: assignAccountsToCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning-categories"] });
      queryClient.invalidateQueries({ queryKey: ["planning-category-accounts", id] });
    },
  });
};

// ===== BULK UPDATE Account Category =====
export const useBulkUpdateAccountCategory = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const bulkUpdateAccountCategory = (body: any) => {
    return axiosAuth.put(`${baseEndpoint}/categories/bulk-update-accounts`, body);
  };

  return useMutation({
    mutationFn: bulkUpdateAccountCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning-categories"] });
    },
  });
};

// ===== categories remove account =====
export const useCategoriesRemoveAccount = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const categoriesRemoveAccount = (body: any) => {
    return axiosAuth.delete(`${baseEndpoint}/categories/remove-accounts`, { data: body });
  };

  return useMutation({
    mutationFn: categoriesRemoveAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning-categories"] });
    },
  });
};