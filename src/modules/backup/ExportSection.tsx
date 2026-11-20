import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { criarBackup } from '../../core/backup/exportar';
import type { BackupGerado } from '../../core/backup/exportar';
import { entregarArquivo } from '../../core/backup/entrega';
import { descreverErroDeArmazenamento } from '../../core/db/erros';
import { lerConfiguracoesExistentes, registrarBackupFeito } from '../../core/db/repositorios';
import { formatarBytes } from '../../core/storage/armazenamento';
import { formatarData } from '../../core/utils/formatarData';
import { Button, FormSection } from '../../design';
import styles from './ExportSection.module.css';

type Mensagem = { tipo: 'ok' | 'erro'; texto: string };

const MS_POR_DIA = 24 * 60 * 60 * 1000;

function textoDoUltimoBackup(ultimo: string | null | undefined): string {
  if (ultimo === undefined) return 'Verificando…';
  if (ultimo === null) return 'Nunca feito';
  const dias = Math.max(0, Math.floor((Date.now() - new Date(ultimo).getTime()) / MS_POR_DIA));
  const quando = dias === 0 ? 'hoje' : dias === 1 ? 'há 1 dia' : `há ${dias} dias`;
  return `${quando} (${formatarData(ultimo)})`;
}

export function ExportSection({ aoMudar }: { aoMudar?: () => void }) {
  const [ultimo, setUltimo] = useState<string | null | undefined>(undefined);
  const [preparado, setPreparado] = useState<BackupGerado | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);

  useEffect(() => {
    let ativo = true;
    lerConfiguracoesExistentes()
      .then((c) => {
        if (ativo) setUltimo(c?.lastBackupAt ?? null);
      })
      .catch(() => {
        if (ativo) setUltimo(null);
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function gerar() {
    setOcupado(true);
    setMensagem(null);
    try {
      setPreparado(await criarBackup());
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: `Não foi possível gerar o backup. ${descreverErroDeArmazenamento(erro)}` });
    } finally {
      setOcupado(false);
    }
  }

  async function salvar() {
    if (!preparado) return;
    try {
      const resultado = await entregarArquivo(preparado.nomeArquivo, preparado.texto);
      if (resultado === 'cancelado') {
        setMensagem({ tipo: 'erro', texto: 'Cancelado. O backup não foi marcado como feito.' });
        return;
      }
      await registrarBackupFeito(preparado.backup.exportedAt);
      setUltimo(preparado.backup.exportedAt);
      setPreparado(null);
      setMensagem({ tipo: 'ok', texto: 'Backup entregue. Guarde o arquivo fora do app, em Arquivos ou no iCloud Drive.' });
      aoMudar?.();
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível salvar o arquivo. Tente de novo.' });
    }
  }

  return (
    <FormSection icon={Download} title="Exportar backup" subtitle="Uma cópia dos seus dados, guardada fora do app">
      <dl className={styles.linhas}>
        <dt>Último backup</dt>
        <dd>{textoDoUltimoBackup(ultimo)}</dd>
        <dt>Esta cópia inclui</dt>
        <dd>Perfil e configurações. As fotos chegam na V3.0.</dd>
      </dl>

      {preparado ? (
        <div className={styles.arquivo}>
          <p className={styles.nome}>{preparado.nomeArquivo}</p>
          <p className={styles.detalhe}>
            {formatarBytes(preparado.bytes)} · integridade verificada (SHA-256 {preparado.backup.checksum.slice(0, 8)}…
            {preparado.backup.checksum.slice(-8)})
          </p>
          <div className={styles.acoes}>
            <Button onClick={() => void salvar()}>Salvar em Arquivos</Button>
            <Button variant="secundario" onClick={() => setPreparado(null)}>
              Descartar
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.acoes}>
          <Button onClick={() => void gerar()} disabled={ocupado}>
            {ocupado ? 'Gerando…' : 'Gerar backup'}
          </Button>
        </div>
      )}

      {mensagem ? (
        <p className={mensagem.tipo === 'ok' ? styles.sucesso : styles.erro} role="status">
          {mensagem.texto}
        </p>
      ) : null}
    </FormSection>
  );
}
