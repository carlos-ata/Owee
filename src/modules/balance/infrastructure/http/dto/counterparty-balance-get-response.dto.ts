import type { CounterpartyBalance } from "#balance/domain/entities/counterparty-balance.entity.js";

export function counterpartyBalanceGetToResponseDto(
  data: CounterpartyBalance[],
) {
  return data.map((balance) => ({
    person: {
      id: balance.personId,
      name: balance.personName,
    },
    balance: {
      receivable: {
        amount: balance.receivableAmount,
      },
      payable: {
        amount: balance.payableAmount,
      },
      concepts: balance.concepts.slice(0, 5),
    },
  }));
}
