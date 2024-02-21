import globalAxios from "@/axios/index";
// @ts-ignore
import store from "store";

export async function login(userData: any) {
  return await globalAxios.post(`/login`, userData);
}

export async function logout() {
  const token = store.get("accessToken");

  return await globalAxios.post(
    `/logout`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
}


