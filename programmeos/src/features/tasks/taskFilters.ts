import type { Priority, Task, TaskStatus } from '@/data/models';

export const PRIORITIES: Priority[] = ['Urgent', 'High', 'Medium', 'Low'];
export const STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Blocked', 'In Review', 'Done'];
export const CATEGORIES: Task['category'][] = ['Faculty', 'Academic', 'Logistics', 'Finance', 'Learners', 'Client', 'Operations'];

export type TaskFilters = {
  priority: Priority[];
  status: TaskStatus[];
  category: Task['category'][];
  programme: string[];
};

export const EMPTY_FILTERS: TaskFilters = { priority: [], status: [], category: [], programme: [] };

export function filterCount(f: TaskFilters) {
  return f.priority.length + f.status.length + f.category.length + f.programme.length;
}

export function applyFilters(tasks: Task[], f: TaskFilters) {
  return tasks.filter(
    (t) =>
      (!f.priority.length || f.priority.includes(t.priority)) &&
      (!f.status.length || f.status.includes(t.status)) &&
      (!f.category.length || f.category.includes(t.category)) &&
      (!f.programme.length || f.programme.includes(t.programmeId)),
  );
}

export type TaskSort = 'due' | 'priority' | 'programme' | 'recent';

export const SORT_LABELS: Record<TaskSort, string> = {
  due: 'Due date',
  priority: 'Priority',
  programme: 'Programme',
  recent: 'Recently created',
};

const RANK: Record<Priority, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

export function sortTasks(tasks: Task[], sort: TaskSort) {
  const list = [...tasks];
  switch (sort) {
    case 'priority':
      return list.sort((a, b) => RANK[a.priority] - RANK[b.priority] || a.dueDate.localeCompare(b.dueDate));
    case 'programme':
      return list.sort((a, b) => a.programmeId.localeCompare(b.programmeId) || a.dueDate.localeCompare(b.dueDate));
    case 'recent':
      return list.sort((a, b) => b.createdOn.localeCompare(a.createdOn) || b.id.localeCompare(a.id));
    default:
      return list.sort((a, b) => a.dueDate.localeCompare(b.dueDate) || RANK[a.priority] - RANK[b.priority]);
  }
}

/** Guess a category from the words in a task title (smart default on task creation). */
export function guessCategory(title: string): Task['category'] | undefined {
  const t = title.toLowerCase();
  if (/(flight|hotel|room|venue|transfer|coach|catering|print|badge|av\b|projector|transport)/.test(t)) return 'Logistics';
  if (/(invoice|po\b|purchase|payment|budget|deposit|expense|reconcile)/.test(t)) return 'Finance';
  if (/(slide|material|case|reading|workbook|module|review)/.test(t)) return 'Academic';
  if (/(faculty|professor|prof\.|dr\.|coach|speaker|contract)/.test(t)) return 'Faculty';
  if (/(participant|learner|registration|register|nomination|welcome pack|access)/.test(t)) return 'Learners';
  if (/(client|sign-off|sign off|agenda|meridian|atlas|orion|npsi|halden)/.test(t)) return 'Client';
  return undefined;
}
