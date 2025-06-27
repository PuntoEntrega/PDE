// src/Services/login.ts
import axios from 'axios'

export interface LoginCredentials {
  username: string
  password: string
}

export async function login(data: LoginCredentials) {
  const response = await axios.post('/api/login', data, {
    withCredentials: true, // 🔥 necesario para que se guarde la cookie
  })

  const { token } = response.data

  localStorage.setItem('token', token)

  return { token }
}
