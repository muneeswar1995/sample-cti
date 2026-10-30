import { APP_API_BASE_URL } from "@env";
import { createRequest } from "@react-solutions/request";

import { showToast } from "@/utils/ShowToast";
import { clearSession, getItem, getSession } from "@/utils/storage";
import { triggerLogout } from "@/context";

const url = (APP_API_BASE_URL || "").trim();
console.log("APP_API_BASE_URL resolved to:", url);

export const requestInstance = createRequest(url, {
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 1000 * 60
});

requestInstance.interceptors.request.use(
  async (config) => {
    const BearerToken = (await getItem("token")) || getSession("token");

    if (BearerToken) {
      config.headers.Authorization = `Bearer ${BearerToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

requestInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    showToast(
      error.response?.data?.message ||
        (typeof error?.response?.data === "string" && error?.response?.data) ||
        error.message ||
        "Something went wrong",
      "error"
    );

    if (error.response?.status === 401) {
      clearSession();
      triggerLogout();
    }

    return Promise.reject(error);
  }
);
