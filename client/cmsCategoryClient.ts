import useAxiosAuth from "@/hooks/axios/use-axios-auth";

export type Category = {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export const useCategoryApi = () => {
  const axiosAuth = useAxiosAuth();

  const fetchCategories = async (params: { page?: number; limit?: number; q?: string }) => {
    const query = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 10),
      q: params.q || "",
    });

    const res = await axiosAuth.get(`/cms-categories?${query.toString()}`);
    return Array.isArray(res.data) ? res.data : [];
  };

  const getCategory = async (id: number) => {
    const res = await axiosAuth.get(`/cms-categories/${id}`);
    return res.data;
  };

  const createCategory = async (payload: { name: string; slug: string }) => {
    const res = await axiosAuth.post(`/cms-categories`, payload);
    return res.data;
  };

  const updateCategory = async (id: number, payload: { name: string; slug: string }) => {
    const res = await axiosAuth.put(`/cms-categories/${id}`, payload);
    return res.data;
  };

  const deleteCategory = async (id: number) => {
    const res = await axiosAuth.delete(`/cms-categories/${id}`);
    return res.data;
  };

  return {
    fetchCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
