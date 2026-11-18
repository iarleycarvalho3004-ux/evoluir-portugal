export function formatarData(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return 'indisponível';
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
