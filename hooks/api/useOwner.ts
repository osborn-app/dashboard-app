import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";
import { useUser } from "@/context/UserContext";

const baseEndpoint = "/owners";
export const useGetOwners = (params: any) => {
  const axiosAuth = useAxiosAuth();

  const getOwners = () => {
    return axiosAuth.get(baseEndpoint, {
      params,
    });
  };

  return useQuery({
    queryKey: ["owners", params],
    queryFn: getOwners,
  });
};

export const useGetInfinityOwners = (query?: string) => {
  const { user } = useUser();
  const axiosAuth = useAxiosAuth();
  const getOwners = ({
    pageParam = 1,
    query,
  }: {
    pageParam?: number;
    query?: string;
  }) => {
    return axiosAuth.get(baseEndpoint, {
      params: {
        limit: 10,
        page: pageParam,
        q: query,
      },
    });
  };

  return useInfiniteQuery({
    queryKey: ["owners", query],
    queryFn: ({ pageParam }) => getOwners({ pageParam, query }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.pagination?.next_page,
    enabled: user?.role !== "owner",
  });
};

export const useGetDetailOwner = (id: string | number) => {
  const axiosAuth = useAxiosAuth();
  const { user } = useUser();

  const getDetailOwner = () => {
    return axiosAuth.get(`${baseEndpoint}/${id}`);
  };

  return useQuery({
    queryKey: ["owners", id],
    queryFn: getDetailOwner,
    enabled: user?.role !== "owner" && !!id,
  });
};

export const usePostOwner = () => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const postOwner = (body: any) => {
    return axiosAuth.post(baseEndpoint, body);
  };

  return useMutation({
    mutationFn: postOwner,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["owners"] });
    },
  });
};

export const useEditOwner = (id: number | string) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const editOwnerFn = (body: any) => {
    return axiosAuth.patch(`${baseEndpoint}/${id}`, body);
  };

  return useMutation({
    mutationFn: editOwnerFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["owners"] });
    },
  });
};

export const useDeleteOwner = (id: number) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const deleteOwnerFn = (id: number) => {
    return axiosAuth.delete(`${baseEndpoint}/${id}`);
  };

  return useMutation({
    mutationFn: deleteOwnerFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["owners"] });
    },
  });
};
