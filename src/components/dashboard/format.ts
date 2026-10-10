export const fmtPct = (x: number) => `${Math.round(x * 100)}%`;
export const fmt1 = (x: number) => x.toFixed(1);
export const fmtInt = (x: number) => Math.round(x).toLocaleString("en-US");
export const fmtUsd = (x: number) =>
  x.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
