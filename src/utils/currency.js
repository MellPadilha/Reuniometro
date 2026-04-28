export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));

export const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
