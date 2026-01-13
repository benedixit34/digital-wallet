export interface User {
    id: string
    first_name: string
    last_name: string
    email: string
    password: string
    created_at?: Date
}

  
export interface JwtPayload {
    sub: string
    email: string
}

export interface Wallet {
  id: string
  user_id: string
  currency: string;
  balance: number
  status: 'active' | 'suspended'
  created_at: string
  updated_at: string
}

export type TransactionType =
  | 'funding'
  | 'transfer'
  | 'withdrawal'
  | 'refund'
  | 'admin_credit'
  | 'admin_debit';

export type TransactionStatus =
  | 'pending'
  | 'success'
  | 'failed';


export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;              
  initiated_by: string | null;
  description: string | null; 
  created_at: string;     
  updated_at: string;        
}
