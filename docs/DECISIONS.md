# Decisões aprovadas e estado do projeto

## Estado
- Etapa 2A: concluída (publicação, CI verde, página validada no iPhone).
- Etapa 2B: estrutura visual aprovada pelo proprietário (aparência validada no iPhone).
- Etapa 2C: em validação (instalação, abertura animada, aviso de nova versão).
- Próximas: 2D dados, 2E backup. Nenhuma iniciada.

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
