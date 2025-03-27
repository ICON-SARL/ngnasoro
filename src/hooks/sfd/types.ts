
import { User } from "@/hooks/useAuth";

export interface SfdData {
  id: string;
  name: string;
  token: string | null;
  lastFetched: Date | null;
}

export interface SfdDataAccess {
  sfdData: SfdData[];
  loading: boolean;
  error: string | null;
  activeSfdId: string | null;
  fetchUserSfds: () => Promise<void>;
  switchActiveSfd: (sfdId: string) => Promise<boolean>;
  getActiveSfdData: () => Promise<SfdData | null>;
  getCurrentSfdToken: () => Promise<string | null>;
}
