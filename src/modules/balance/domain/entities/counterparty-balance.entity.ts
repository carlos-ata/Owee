export interface CounterpartyBalanceProps {
  personId: string | null;
  personName: string;
  receivableAmount: string;
  payableAmount: string;
  concepts: string[];
}

export class CounterpartyBalance {
  personId: string | null;
  personName: string;
  receivableAmount: string;
  payableAmount: string;
  concepts: string[];

  constructor(props: CounterpartyBalanceProps) {
    this.personId = props.personId;
    this.personName = props.personName;
    this.receivableAmount = props.receivableAmount;
    this.payableAmount = props.payableAmount;
    this.concepts = props.concepts;
  }

  static reconstitute(props: CounterpartyBalanceProps) {
    return new CounterpartyBalance(props);
  }
}
