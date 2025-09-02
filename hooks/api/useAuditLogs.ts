import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../axios/use-axios-auth";

const baseEndpoint = "/audit-logs";

interface GetAuditLogsParams {
  table_name?: string;
  record_id?: string;
  action?: string;
  user_id?: string;
  page?: number;
  limit?: number;
  order_by?: string;
  order_direction?: 'ASC' | 'DESC';
}

export const useGetAuditLogs = (params: GetAuditLogsParams, options = {}) => {
  const axiosAuth = useAxiosAuth();

  const getAuditLogs = async () => {
    const { data } = await axiosAuth.get(baseEndpoint, {
      params,
    });
    return data;
  };

  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: getAuditLogs,
    ...options,
  });
};

export const useGetAuditLogsByTableAndRecord = (
  tableName: string, 
  recordId: string, 
  params: Omit<GetAuditLogsParams, 'table_name' | 'record_id'> = {},
  options = {}
) => {
  const axiosAuth = useAxiosAuth();

  const getAuditLogs = async () => {
    const { data } = await axiosAuth.get(baseEndpoint, {
      params: {
        table_name: tableName,
        record_id: recordId,
        ...params,
      },
    });
    return data;
  };

  return useQuery({
    queryKey: ["audit-logs", tableName, recordId, params],
    queryFn: getAuditLogs,
    ...options,
  });
};

export const useGetAuditLogsByTable = (
  tableName: string, 
  params: Omit<GetAuditLogsParams, 'table_name'> = {},
  options = {}
) => {
  const axiosAuth = useAxiosAuth();

  const getAuditLogs = async () => {
    const { data } = await axiosAuth.get(baseEndpoint, {
      params: {
        table_name: tableName,
        ...params,
      },
    });
    return data;
  };

  return useQuery({
    queryKey: ["audit-logs", tableName, params],
    queryFn: getAuditLogs,
    ...options,
  });
};

export const useGetAuditLogsByUser = (
  userId: string, 
  params: Omit<GetAuditLogsParams, 'user_id'> = {},
  options = {}
) => {
  const axiosAuth = useAxiosAuth();

  const getAuditLogs = async () => {
    const { data } = await axiosAuth.get(baseEndpoint, {
      params: {
        user_id: userId,
        ...params,
      },
    });
    return data;
  };

  return useQuery({
    queryKey: ["audit-logs", "user", userId, params],
    queryFn: getAuditLogs,
    ...options,
  });
};
