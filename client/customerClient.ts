import client from "./apiClient";

export const getCustomers = () => {
  return client.get("/customers");
};

export const getCustomerRanking = (limit: number = 10) => {
  return client.get(`/customers/ranking/transaction-amount?limit=${limit}`);
};