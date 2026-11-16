export interface BalanceProps {
  payableAmount: string;
  receivableAmount: string;
  payableCount: number;
  receivableCount: number;
}

export class Balance {
  payableAmount: string;
  receivableAmount: string;
  payableCount: number;
  receivableCount: number;

  constructor(props: BalanceProps) {
    this.payableAmount = props.payableAmount;
    this.receivableAmount = props.receivableAmount;
    this.payableCount = props.payableCount;
    this.receivableCount = props.receivableCount;
  }

  static reconstitute(props: BalanceProps) {
    return new Balance({
      payableAmount: props.payableAmount,
      receivableAmount: props.receivableAmount,
      payableCount: props.payableCount,
      receivableCount: props.receivableCount,
    });
  }
}
