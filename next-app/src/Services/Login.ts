// src/Services/login.ts
import axios from 'axios'

export interface LoginCredentials {
  username: string
  password: string
}

export async function login(data: LoginCredentials) {
  const response = await axios.post('/api/login', data)
  const { token, relationedCompanyId } = response.data

  localStorage.setItem('token', token)
  localStorage.setItem('relationedCompany', relationedCompanyId)

  return { token, relationedCompanyId }
}
