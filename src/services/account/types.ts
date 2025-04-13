
export interface Account {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

export interface UpdateBalanceParams {
  amount: number;
}
