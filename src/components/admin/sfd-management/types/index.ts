
export interface SfdAdminFormData {
  full_name: string;
  email: string;
  password: string;
  sfd_id: string;
  notify: boolean;
}

export interface SfdAdminCreationResponse {
  success: boolean;
  error?: string;
}
