import type { Balance } from "#balance/domain/entities/balance.entity.js";

export function balanceGetToResponseMapper(data: Balance) {
  return {
    receivable: {
      amount: data.receivableAmount,
      count: data.receivableCount,
    },
    payable: {
      amount: data.payableAmount,
      count: data.payableCount,
    },
  };
}
