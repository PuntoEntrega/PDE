// src/Services/register.ts
import axios from "axios"

export interface RegisterData { /* … */ }

export async function register(data: RegisterData) {
  return axios.post("/api/register", data, { withCredentials: true })
              .then(res => res.data)
}