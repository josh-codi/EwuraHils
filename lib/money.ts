export function pesewasToGhs(value: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(value / 100)
}

export function ghsToPesewas(value: number): number {
  return Math.round(value * 100)
}

export function formatMoney(pesewas: number): string {
  return pesewasToGhs(pesewas)
}