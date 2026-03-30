export interface Patient {
  id: string
  rut?: string
  first_name: string
  last_name: string
  birth_date?: string
  gender?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir'
  /** Clinical/contact email — NOT the authentication email. */
  email?: string
  phone?: string
  address?: string
  city?: string
  region?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  general_notes?: string
  patient_type: 'particular' | 'company' | 'both'
  status: 'active' | 'inactive' | 'discharged'
  /** ID of another patient who acts as this patient's guardian/tutor. */
  tutor_id?: string
  /** True when this patient has a linked portal user account. */
  has_login: boolean
  created_at: string
  updated_at?: string
  created_by?: string
}

export interface PatientDetail extends Patient {
  companies: CompanyAssociationDetail[]
  /** Tutor of this patient (if any). */
  tutor?: TutorInfo
  /** Patients that this patient tutors (their wards). */
  wards: TutorInfo[]
}

export interface TutorInfo {
  id: string
  first_name: string
  last_name: string
  rut?: string
}

export interface CompanyAssociationDetail {
  id: string
  company_id: string
  position?: string
  department?: string
  is_active: boolean
  start_date?: string
  end_date?: string
  notes?: string
  created_at: string
}

export interface ClinicalRecord {
  id: string
  patient_id: string
  main_diagnosis?: string
  allergies?: string
  current_medications?: string
  relevant_history?: string
  family_history?: string
  physical_restrictions?: string
  alerts?: string
  occupation?: string
  consent_signed: boolean
  consent_date?: string
  consent_version?: string
  created_at: string
  updated_at?: string
  /** Full name of the user who created the record. */
  created_by_name?: string
  /** Full name of the user who last edited the record. */
  updated_by_name?: string
}

export interface PatientFilters {
  search?: string
  status?: string
  patient_type?: string
  company_id?: string
  follow_up_pending?: boolean
}

export interface CompanyAssociationInput {
  company_id: string
  position?: string
  department?: string
  start_date?: string
  notes?: string
}

export interface CreatePatientInput {
  rut?: string
  first_name: string
  last_name: string
  birth_date?: string
  gender?: string
  /** Clinical/contact email only — not used as login credential. */
  email?: string
  phone?: string
  address?: string
  city?: string
  region?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  general_notes?: string
  patient_type: string
  /** Link to an existing adult patient who acts as guardian. */
  tutor_id?: string
  companies?: CompanyAssociationInput[]
  /** Optional: also create a portal login at the same time. */
  login?: EnableLoginInput
}

export interface UpdatePatientInput {
  rut?: string
  first_name?: string
  last_name?: string
  birth_date?: string
  gender?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  region?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  general_notes?: string
  patient_type?: string
  status?: string
  /** New tutor ID. Pass null UUID to clear. */
  tutor_id?: string
  /** Set to true to explicitly remove the current tutor. */
  clear_tutor?: boolean
  /**
   * Replaces ALL company associations.
   * - omit     → don't touch companies
   * - []       → remove all companies
   * - [...]    → replace with these
   */
  companies?: CompanyAssociationInput[]
}

/** Payload for POST /patients/:id/login */
export interface EnableLoginInput {
  /** Authentication email — must be unique. Does NOT have to match contact email. */
  login_email?: string
  login_password: string
}

/** Response from GET /patients/:id/login */
export interface PatientLoginInfo {
  user_id: string
  email: string
  is_active: boolean
  roles: string[]
  created_at: string
}
