export interface DebtProps {
  id: number;
  creatorId: string;
  debtorId: string;
  creditorId: string | null;
  reconciledIntoId: number | null;
  description: string;
  amount: string;
  isSettled: boolean;
  isConfirmed: boolean | null;
  status: DebtStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DebtCreateProps {
  creatorId: string;
  debtorId: string;
  creditorId: string | null;
  description: string;
  amount: string;
}

export interface NewDebtData {
  creatorId: string;
  debtorId: string;
  creditorId: string | null;
  reconciledIntoId: number | null;
  description: string;
  amount: string;
  isSettled: boolean;
  isConfirmed: boolean | null;
  status: DebtStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DebtIdentityProps {
  id: number;
}

export interface DebtSettleData {
  id: number;
  isSettled: boolean;
  updatedAt: string;
}

export interface DebtConfirmData {
  id: number;
  isConfirmed: boolean;
  updatedAt: string;
}

export interface DebtCancelData {
  id: number;
  status: DebtStatus;
  updatedAt: string;
}

export type DebtStatus = "A" | "I";

export class Debt {
  public readonly id: number;
  public creatorId: string;
  public debtorId: string;
  public creditorId: string | null;
  public reconciledIntoId: number | null;
  public description: string;
  public amount: string;
  public isSettled: boolean;
  public isConfirmed: boolean | null;
  public status: DebtStatus;
  public createdAt: string;
  public updatedAt: string;

  private constructor(props: DebtProps) {
    this.id = props.id;
    this.creatorId = props.creatorId;
    this.debtorId = props.debtorId;
    this.creditorId = props.creditorId;
    this.reconciledIntoId = props.reconciledIntoId;
    this.description = props.description;
    this.amount = props.amount;
    this.isSettled = props.isSettled;
    this.isConfirmed = props.isConfirmed;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: DebtCreateProps): NewDebtData {
    const now = new Date();
    return {
      creatorId: props.creatorId,
      debtorId: props.debtorId,
      creditorId: props.creditorId,
      reconciledIntoId: null,
      description: props.description,
      amount: props.amount,
      isSettled: false,
      isConfirmed: !!!props.creditorId,
      status: "A",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  static reconstitute(props: DebtProps): Debt {
    return new Debt(props);
  }

  // static settle(props: DebtIdentityProps): DebtSettleData {
  //   const now = new Date();
  //   return {
  //     id: props.id,
  //     isSettled: true,
  //     updatedAt: now.toISOString(),
  //   };
  // }

  static confirm(props: DebtIdentityProps): DebtConfirmData {
    const now = new Date();
    return {
      id: props.id,
      isConfirmed: true,
      updatedAt: now.toISOString(),
    };
  }

  static cancel(props: DebtIdentityProps): DebtCancelData {
    const now = new Date();
    return {
      id: props.id,
      status: "I",
      updatedAt: now.toISOString(),
    };
  }
}
