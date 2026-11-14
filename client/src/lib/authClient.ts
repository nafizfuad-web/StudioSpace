import { createAuthClient } from "better-auth/react";
import { API_URL } from "@/lib/apiUrl";

export const authClient = createAuthClient({
  baseURL: API_URL,
});
