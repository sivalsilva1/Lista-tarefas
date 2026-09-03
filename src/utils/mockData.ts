import type { Category, Task } from '../types/task';
import { getTodayDateString } from './dateUtils';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'trabalho',
    name: 'Trabalho',
    color: '#3b82f6',
    bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
    textLight: 'text-blue-700',
    bgDark: 'dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50',
    textDark: 'dark:text-blue-300',
  },
  {
    id: 'pessoal',
    name: 'Pessoal',
    color: '#10b981',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textLight: 'text-emerald-700',
    bgDark: 'dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50',
    textDark: 'dark:text-emerald-300',
  },
  {
    id: 'estudos',
    name: 'Estudos',
    color: '#8b5cf6',
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
    textLight: 'text-purple-700',
    bgDark: 'dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/50',
    textDark: 'dark:text-purple-300',
  },
  {
    id: 'financas',
    name: 'Finanças',
    color: '#f59e0b',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    textLight: 'text-amber-700',
    bgDark: 'dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/50',
    textDark: 'dark:text-amber-300',
  },
  {
    id: 'saude',
    name: 'Saúde',
    color: '#ec4899',
    bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
    textLight: 'text-rose-700',
    bgDark: 'dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/50',
    textDark: 'dark:text-rose-300',
  },
  {
    id: 'projetos',
    name: 'Projetos',
    color: '#06b6d4',
    bgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    textLight: 'text-cyan-700',
    bgDark: 'dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/50',
    textDark: 'dark:text-cyan-300',
  },
];

export function getInitialTasks(): Task[] {
  const today = getTodayDateString();
  
  const dToday = new Date(today + 'T00:00:00');
  
  const dYesterday = new Date(dToday);
  dYesterday.setDate(dYesterday.getDate() - 2);
  const yesterdayStr = dYesterday.toISOString().slice(0, 10);
  
  const dTomorrow = new Date(dToday);
  dTomorrow.setDate(dTomorrow.getDate() + 1);
  const tomorrowStr = dTomorrow.toISOString().slice(0, 10);
  
  const dNextWeek = new Date(dToday);
  dNextWeek.setDate(dNextWeek.getDate() + 5);
  const nextWeekStr = dNextWeek.toISOString().slice(0, 10);

  const nowIso = new Date().toISOString();

  return [
    {
      id: 'task-1',
      title: 'Finalizar documentação da nova API REST',
      description: 'Revisar endpoints de autenticação, paginação e esquemas JSON OpenAPI antes da entrega para a equipe frontend.',
      completed: false,
      category: 'trabalho',
      priority: 'urgent',
      dueDate: today,
      createdAt: nowIso,
      updatedAt: nowIso,
      pinned: true,
      subtasks: [
        { id: 'sub-1', title: 'Documentar rota /auth/login', completed: true },
        { id: 'sub-2', title: 'Adicionar exemplos de Payload JSON', completed: true },
        { id: 'sub-3', title: 'Validar códigos de resposta HTTP', completed: false },
      ],
    },
    {
      id: 'task-2',
      title: 'Declaração e conciliação de despesas mensais',
      description: 'Lançar notas fiscais e conferir extratos bancários da conta PJ referente ao último mês.',
      completed: false,
      category: 'financas',
      priority: 'high',
      dueDate: yesterdayStr, // Atrasada para visualização do alerta
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'task-3',
      title: 'Treino funcional & 5km de corrida',
      description: 'Sessão de mobilidade matinal e corrida leve no parque para manter a meta de saúde semanal.',
      completed: true,
      category: 'saude',
      priority: 'medium',
      dueDate: today,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'task-4',
      title: 'Módulo de Design Systems no curso avançado',
      description: 'Estudar tokens de cor, escala tipográfica, acessibilidade WCAG 2.2 e implementação de componentes acessíveis.',
      completed: false,
      category: 'estudos',
      priority: 'medium',
      dueDate: tomorrowStr,
      createdAt: nowIso,
      updatedAt: nowIso,
      subtasks: [
        { id: 'sub-4-1', title: 'Assistir aula sobre Color Contrast', completed: true },
        { id: 'sub-4-2', title: 'Praticar com Tailwind CSS e React', completed: false },
      ],
    },
    {
      id: 'task-5',
      title: 'Planejamento da viagem de férias',
      description: 'Pesquisar passagens aéreas, reservas de hospedagem e montar roteiro dos principais passeios.',
      completed: false,
      category: 'pessoal',
      priority: 'low',
      dueDate: nextWeekStr,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'task-6',
      title: 'Refatoração da arquitetura de microsserviços',
      description: 'Migração de serviços legados e criação de testes automatizados unitários e de integração.',
      completed: true,
      category: 'projetos',
      priority: 'high',
      dueDate: yesterdayStr,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];
}
