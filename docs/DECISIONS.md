# Decisões aprovadas e estado do projeto

## Estado
- Etapa 2A: em validação (publicação + página mínima).
- Próximas: 2B visual, 2C PWA, 2D dados, 2E backup. Nenhuma iniciada.

## Stack aprovada
Vite + React + TypeScript + Dexie + Recharts + CSS Modules. fflate para ZIP de backup.
Hospedagem: Cloudflare Pages + Workers (plano gratuito). Idioma: pt-BR. Mobile-first, prioridade iPhone.

## Identidade visual
Verde #046A38 · Vermelho #DA291C · Branco #F5F2E9 · Grafite #151515. Interface escura.

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
