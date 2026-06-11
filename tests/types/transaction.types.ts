export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status?: 'pending' | 'reconciled' | 'disputed';
  category?: string;
  reference?: string;
}
