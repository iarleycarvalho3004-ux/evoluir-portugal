import type { LucideIcon } from 'lucide-react';
import { Apple, Dumbbell, Home, MoreHorizontal, TrendingUp } from 'lucide-react';

export type NavItem = { to: string; label: string; icon: LucideIcon };

export const navItems: NavItem[] = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/treino', label: 'Treino', icon: Dumbbell },
  { to: '/nutricao', label: 'Nutrição', icon: Apple },
  { to: '/evolucao', label: 'Evolução', icon: TrendingUp },
  { to: '/mais', label: 'Mais', icon: MoreHorizontal },
];
