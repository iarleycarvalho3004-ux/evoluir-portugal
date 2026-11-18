export type AvisoBackup =
  | { tipo: 'nunca' }
  | { tipo: 'desatualizado'; dias: number }
  | { tipo: 'em-dia'; dias: number };

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function avaliarBackup(ultimoBackupEm: string | null, agora: Date, limiteDias: number): AvisoBackup {
  if (ultimoBackupEm === null) return { tipo: 'nunca' };
  const ultimo = new Date(ultimoBackupEm);
  if (Number.isNaN(ultimo.getTime())) return { tipo: 'nunca' };
  const dias = Math.max(0, Math.floor((agora.getTime() - ultimo.getTime()) / MS_POR_DIA));
  return dias > limiteDias ? { tipo: 'desatualizado', dias } : { tipo: 'em-dia', dias };
}
