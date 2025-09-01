import client from "./apiClient";

export const getAuditLogs = (params?: any) => {
  return client.get("/audit-logs", { params });
};

export const getAuditLogsByTableAndRecord = (tableName: string, recordId: string, params?: any) => {
  return client.get("/audit-logs", { 
    params: { 
      table_name: tableName,
      record_id: recordId,
      ...params 
    } 
  });
};

export const getAuditLogsByTable = (tableName: string, params?: any) => {
  return client.get("/audit-logs", { 
    params: { 
      table_name: tableName,
      ...params 
    } 
  });
};

export const getAuditLogsByUser = (userId: string, params?: any) => {
  return client.get("/audit-logs", { 
    params: { 
      user_id: userId,
      ...params 
    } 
  });
};

export const getAuditLogsByAction = (action: string, params?: any) => {
  return client.get("/audit-logs", { 
    params: { 
      action: action,
      ...params 
    } 
  });
};
