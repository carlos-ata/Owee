export interface DebtCreateDTO {
  debtorId: string;
  creditorId: string | null;
  description: string;
  amount: string;
}
