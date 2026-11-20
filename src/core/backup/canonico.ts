/** JSON com chaves ordenadas: a mesma informação sempre gera o mesmo texto (base do checksum). */
export function jsonCanonico(valor: unknown): string {
  if (valor === null || typeof valor !== 'object') return JSON.stringify(valor) ?? 'null';
  if (Array.isArray(valor)) return `[${valor.map(jsonCanonico).join(',')}]`;
  const objeto = valor as Record<string, unknown>;
  const chaves = Object.keys(objeto)
    .filter((chave) => objeto[chave] !== undefined)
    .sort();
  return `{${chaves.map((chave) => `${JSON.stringify(chave)}:${jsonCanonico(objeto[chave])}`).join(',')}}`;
}

/** Profundidade máxima de aninhamento de um texto JSON, sem interpretá-lo. Para ao passar do limite. */
export function profundidadeJson(texto: string, limite: number): number {
  let profundidade = 0;
  let maxima = 0;
  let dentroDeTexto = false;
  let escapado = false;
  for (let i = 0; i < texto.length; i += 1) {
    const c = texto.charCodeAt(i);
    if (dentroDeTexto) {
      if (escapado) escapado = false;
      else if (c === 92) escapado = true;
      else if (c === 34) dentroDeTexto = false;
      continue;
    }
    if (c === 34) dentroDeTexto = true;
    else if (c === 123 || c === 91) {
      profundidade += 1;
      if (profundidade > maxima) maxima = profundidade;
      if (maxima > limite) return maxima;
    } else if (c === 125 || c === 93) profundidade -= 1;
  }
  return maxima;
}
