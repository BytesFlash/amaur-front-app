export interface AuthUser {
  id: string
  email: string
  company_id?: string
  patient_id?: string
  first_name: string
  last_name: string
  roles: string[]
  permissions: string[]
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_at: string
  user: AuthUser
}
