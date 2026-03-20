export interface Client {
  id: string;
  name: string;
  notes: string;
  postproxy_profile_group_id: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  auth_id: string;
  email: string;
  role: "owner" | "member";
  created_at: string;
}

export interface Invite {
  id: string;
  email: string;
  token: string;
  invited_by: string;
  created_at: string;
}
