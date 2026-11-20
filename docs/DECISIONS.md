# Decisões aprovadas e estado do projeto

## Estado
- Etapa 2A: concluída (publicação, CI verde, página validada no iPhone).
- Etapa 2B: estrutura visual aprovada pelo proprietário (aparência validada no iPhone).
- Etapa 2C: aprovada pelo proprietário (instalação, abertura animada, aviso de nova versão).
- Etapa 2D: aprovada pelo proprietário (dados, perfil opcional, armazenamento e alertas).
- Etapa 2E: em validação (backup, restauração e tutorial de instalação por sistema). Versão 0.5.0.
- Próxima: Etapa 3 (Treino, V1.0). Não iniciada.

## Stack aprovada
Vite + React + TypeScript + Dexie + Recharts + CSS Modules. fflate para ZIP de backup.
React Router e lucide-react aprovados. Hospedagem: Cloudflare (plano gratuito). Idioma: pt-BR.
Mobile-first, prioridade iPhone.

## Decisões da 2B
- Direção visual aprovada: assinatura da faixa 2:3 (verde 2/5, vermelho 3/5, como na bandeira), Barlow Condensed (títulos) e Barlow (texto), cartões em tons de grafite.
- Navegação inferior: Início, Treino, Nutrição, Evolução, Mais.
- **Uso offline descartado pelo proprietário.** Fontes são carregadas do Google Fonts (sem pacotes extras).
  A Etapa 2C deve ser reconfirmada: instalação na Tela de Início e fluxo de atualização continuam; cache offline não.

## Identidade visual
Verde #046A38 · Vermelho #DA291C · Branco #F5F2E9 · Grafite #151515. Interface escura.
Tons derivados (superfícies, bordas, texto suave) ficam em src/design/tokens.css.

## Armazenamento e privacidade
- IndexedDB (Dexie) como banco principal, só no aparelho. Sem LocalStorage como banco.
- O armazenamento do iPhone nunca é tratado como permanente. Backup externo é essencial.
- Backup padrão sem fotos; com fotos em ZIP. Mesclagem preserva relacionamentos e trata conflitos por tipo de dado.
- Restauração só após snapshot criado e verificado; cancelável; desfazível.
- Data de nascimento, sexo e restrições alimentares são opcionais.

## IA (Etapa 8)
Opcional, desligada por padrão. Chave do provedor só no Worker. Sem segredo fixo no front.
Pareamento opcional, revogável. Fotos e dados pessoais nunca enviados sem autorização explícita.

## Regras permanentes
Fidelidade ao projeto; etapas isoladas; qualidade visual e técnica; preservação de dados;
testes; transparência; continuidade; resumo ao fim de cada etapa; mudanças de escopo exigem aprovação.

## Decisões da 2C
- Ícone aprovado: opção C (letra E + faixa 2:3 na lateral, sobre grafite).
- Abertura animada (a critério do desenvolvedor, aprovada em conceito): a faixa se desenha, gira e vira a lateral do logotipo; o E se constrói; o nome sobe. Uma vez por sessão, pode ser pulada com um toque.
- Sem cache offline e sem service worker. Aviso de nova versão por version.json (comparação do build).
- Numeração de versões: 0.x fundação (0.3 = 2C, 0.4 = 2D dados, 0.5 = 2E backup); a partir da V1.0, um módulo por versão
  (V1.0 Treino, V2.0 Nutrição, V3.0 Evolução, V4.0 Hábitos, V5.0 Dashboard, V6.0 Assistente). Nas telas vazias, o texto é "Iarley vai desenvolver na Vx.x".

## Decisões da 2D
- Schema Dexie v1 contém só `profile` e `settings` (registros únicos, id "main"). Tabelas de cada módulo entram por migração na etapa dele.
- Perfil: todos os campos opcionais (altura, nascimento OU idade aproximada, sexo, objetivo, meta de peso, restrições). Cada campo mostra sua finalidade.
- Validação com Zod (estrito: campos desconhecidos são recusados). Dados inválidos não são gravados.
- Armazenamento: pedido de persistência na abertura, resultado real exibido; alerta de espaço a 70% e 90%; alerta de uso no Safari em vez do app instalado; aviso de backup (nunca / desatualizado / em dia).
- Pendentes para etapas futuras: "incluir no contexto da IA" por campo (V6.0); metas calóricas (V2.0); nível de treino (V1.0); registro do último backup (V0.5).

## Refinamentos da 2D (feedback do proprietário)
- Configurações redesenhada: painel do perfil com números grandes e IMC/diferença para a meta calculados de verdade; blocos Medidas, Sobre você, Objetivo e Alimentação; barra de salvar fixa só quando há alterações; painel "Seus dados" com status.
- Peso atual adicionado ao perfil (`currentWeightKg`). É o ponto de partida: na V3.0 vira o primeiro registro do histórico de peso.
- Objetivos ampliados para 8, cada um com descrição (hipertrofia, ganho de peso, emagrecimento, definição, recomposição, manutenção, força, saúde e condicionamento).
- Restrições alimentares como opções marcáveis, com campo para restrições próprias.
- Campo de data corrigido para o iOS (não estoura mais o cartão).
- "App instalado" virou selo discreto no rodapé de Mais; o guia só aparece quando o app não está instalado.
- Aviso de nova versão movido para o topo da tela, para não colidir com a barra de salvar.

## Decisões da 2E
- Backup em JSON (padrão, sem fotos), com checksum SHA-256 sobre o JSON canônico dos dados. SHA-256 nativo (crypto.subtle) com reserva em JavaScript puro.
- Validação em memória antes de qualquer gravação: limite de 25 MB, profundidade máxima 12, schema estrito (Zod), versões, ids repetidos, integridade referencial (lista `RELACOES`, vazia até haver tabelas com relacionamentos).
- Restauração: prévia → escolha (mesclar ou substituir) → snapshot criado, relido e verificado → confirmação explícita → gravação em uma única transação. Cancelável até a confirmação; desfazer pelo snapshot. Mantidos os 3 snapshots mais recentes; podem ser salvos em Arquivos.
- Mesclagem por tipo de dado: perfil (registro único) com conflito resolvido pelo usuário (padrão: o mais recente); configurações mantêm as deste aparelho, exceto a data do último backup (a mais recente). Tabelas futuras declaram suas regras em `restaurar.ts` e suas relações em `RELACOES`.
- Schema Dexie v2: tabela `snapshots` (fora do backup).
- Fotos e ZIP (fflate): adiados para a V3.0, quando existirem fotos. Um arquivo que declare fotos é recusado com mensagem clara.
- Exportação em dois toques (gerar, depois salvar) para a folha de compartilhamento do iOS aceitar o gesto. A data do último backup só é registrada depois que o arquivo é entregue.
- Avisos de backup: linha em Configurações e aviso na tela Início (só quando há dados).
- Tutorial de instalação por sistema: iOS (Safari / outros navegadores) e Android (Chrome e similares, Samsung Internet, Firefox). No Chrome do Android, botão "Instalar agora" quando o navegador libera o aviso de instalação.
