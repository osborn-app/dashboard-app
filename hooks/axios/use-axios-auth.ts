"use client";

import axios from "@/lib/axios";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const useAxiosAuth = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const requestIntercept = axios.interceptors.request.use(
      (config) => {
        // @ts-ignore
        const token = session?.user?.accessToken;

        if (!config.headers["Authorization"] && token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // const responseIntercept = axios.interceptors.response.use(
    //   (response) => response,
    //   async (error) => {
    //     const prevRequest = error?.config;
    // if (
    //   error?.response?.status === 401 &&
    //   !prevRequest?.sent &&
    //   error.config.request.url !== "v1/auth/logout"
    // ) {
    //   prevRequest.sent = true;
    //   const res = await refreshToken();
    //   prevRequest.headers[
    //     "Authorization"
    //   ] = `Bearer ${session?.user.accessToken}`;

    //   if (res.status === 200) {
    //     return axios(prevRequest);
    //   } else {
    //     return Promise.reject(error);
    //   }
    // }
    //     return Promise.reject(error);
    //   },
    // );

    return () => {
      axios.interceptors.request.eject(requestIntercept);
      // axios.interceptors.response.eject(responseIntercept);
    };
  }, [session]);

  return axios;
};

export default useAxiosAuth;
