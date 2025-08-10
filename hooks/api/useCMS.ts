"use client";

import { CMSResponse } from "@/components/forms/types/cms";
import useAxiosAuth from "../axios/use-axios-auth";
import { useMemo } from "react";

export const useCMSService = () => {
  const axiosAuth = useAxiosAuth();

  return useMemo(() => ({
    async getCMSData(page: number = 1, limit: number = 10, q: string = "") {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(q && { q: encodeURIComponent(q) }),
      });

      const response = await axiosAuth.get(`/cms?${queryParams.toString()}`);
      return response.data as CMSResponse;
    },

    async toggleStatus(id: number, newStatus: boolean) {
      await axiosAuth.patch(`/cms/${id}/toggle`, {
        is_active: newStatus,
      });
    },
  }), [axiosAuth]);
};

export default useCMSService;