import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

const baseEndpoint = "/users";

export const useGetUsers = (
  params: { role?: string; page?: number; limit?: number; q?: string },
  options = {}
) => {
  const axiosAuth = useAxiosAuth();

  const getUsers = async () => {
    const { data } = await axiosAuth.get(baseEndpoint, { params });
    return data;
  };

  return useQuery({
    queryKey: ["users", params],
    queryFn: getUsers,
    ...options,
  });
};

export const useGetUserById = (id: string | number, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getUserById = async () => {
    const { data } = await axiosAuth.get(`${baseEndpoint}/${id}`);
    return data;
  };

  return useQuery({
    queryKey: ["users", id],
    queryFn: getUserById,
    enabled: !!id,
    ...options,
  });
};

export const useDeleteUser = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteUser = (id: string | number) => {
    return axiosAuth.delete(`${baseEndpoint}/${id}`);
  };

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useRegisterUser = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const registerUser = (body: {
    name: string;
    email: string;
    role: string;
    phone_number: string;
    password: string;
  }) => {
    return axiosAuth.post("/auth/register", body);
  };

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
