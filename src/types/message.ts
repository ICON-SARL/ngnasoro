
export type UserRoleType = 'admin' | 'sfd_admin' | 'user' | 'meref_admin';

export type Message = {
  id: string;
  sender_id: string;
  recipient_id?: string;
  recipient_role?: UserRoleType;
  content: string;
  type: 'direct' | 'group' | 'broadcast';
  thread_id?: string;
  parent_id?: string;
  attachments?: Record<string, any>;
  metadata?: Record<string, any>;
  read_by: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type SendMessageParams = {
  content: string;
  recipient_id?: string;
  recipient_role?: UserRoleType;
  type?: 'direct' | 'group' | 'broadcast';
  thread_id?: string;
  parent_id?: string;
  attachments?: Record<string, any>;
  metadata?: Record<string, any>;
};
