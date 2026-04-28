const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export function formatCurrency (value) {
  return currencyFormatter.format(Number(value || 0))
}

export function formatNumber (value) {
  return numberFormatter.format(Number(value || 0))
}

export function roundMoney (value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100
}
