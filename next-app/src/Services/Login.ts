// src/Services/login.ts
import axios from 'axios'

export interface LoginCredentials {
  username: string
  password: string
}

export async function login(data: LoginCredentials) {
  const response = await axios.post('/api/login', data)
  const token = response.data.token
  localStorage.setItem('token', token) // ✅ Guardalo localmente

  return token
}
