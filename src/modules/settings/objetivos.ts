import type { Choice } from '../../design';
import type { Goal } from '../../core/db/types';

export const OBJETIVOS: Choice<Goal>[] = [
  {
    value: 'hypertrophy',
    label: 'Hipertrofia',
    description: 'Ganhar massa muscular. Treino com volume e progressão de carga, comendo um pouco acima da manutenção.',
  },
  {
    value: 'weight-gain',
    label: 'Ganho de peso',
    description:
      'Subir de peso de forma saudável. Calorias acima do que você gasta, com treino de força para que o ganho seja principalmente massa.',
  },
  {
    value: 'fat-loss',
    label: 'Emagrecimento',
    description: 'Reduzir gordura corporal. Déficit calórico moderado, mantendo o treino para preservar o máximo de músculo.',
  },
  {
    value: 'definition',
    label: 'Definição',
    description: 'Secar sem perder o que você já construiu. Déficit curto, proteína alta e carga mantida no treino.',
  },
  {
    value: 'recomposition',
    label: 'Recomposição',
    description: 'Perder gordura e ganhar músculo ao mesmo tempo. Calorias perto da manutenção e progresso mais lento, porém constante.',
  },
  {
    value: 'maintenance',
    label: 'Manutenção',
    description: 'Manter o peso e a massa muscular atuais, com treino e alimentação estáveis.',
  },
  {
    value: 'strength',
    label: 'Força',
    description: 'Aumentar as cargas máximas. Foco em exercícios básicos, poucas repetições e descanso maior.',
  },
  {
    value: 'health',
    label: 'Saúde e condicionamento',
    description: 'Mais disposição e resistência, com hábitos sustentáveis. O foco é o bem-estar, não a estética.',
  },
];

export const SUGESTOES_RESTRICOES = ['Lactose', 'Glúten', 'Amendoim', 'Frutos do mar', 'Ovo', 'Soja', 'Vegetariano', 'Vegano'];
