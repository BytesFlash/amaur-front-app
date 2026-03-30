export interface Company {
  id: string
  rut?: string
  name: string
  fantasy_name?: string
  industry?: string
  size_category?: 'micro' | 'pequeña' | 'mediana' | 'grande'
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  billing_email?: string
  address?: string
  city?: string
  region?: string
  website?: string
  status: 'active' | 'inactive' | 'prospect' | 'churned'
  commercial_notes?: string
  lead_source?: string
  created_at: string
}

export interface CompanyBranch {
  id: string
  company_id: string
  name: string
  address?: string
  city?: string
  region?: string
  contact_name?: string
  contact_phone?: string
  is_main: boolean
  is_active: boolean
}
