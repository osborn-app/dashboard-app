import client from "./apiClient";

export const getReimburse = () => {
  return client.get("/driver-reimburses");
};
