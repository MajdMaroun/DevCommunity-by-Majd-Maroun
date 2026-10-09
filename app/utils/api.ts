import axios from "axios";

export async function apiRequest<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  data?: any
): Promise<T> {
  const response = await axios({
    url,
    method,
    data,
  });

  return response.data;
}