import axios from "axios"

export const login = async (data: { username: string; password: string }) => {
  const response = await axios.post("/api/login", data)
  return response.data
}