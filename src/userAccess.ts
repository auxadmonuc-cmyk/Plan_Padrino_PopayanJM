import { User, UserRole } from './types';

export type UserGroup = 'admins' | 'consulta';

export function groupUsers(users: User[]): Record<UserGroup, User[]> {
  const admins: User[] = [];
  const consulta: User[] = [];

  for (const u of users) {
    if (!u?.isActive) continue;
    if (u.role === 'Administrador') admins.push(u);
    else if (u.role === 'Consulta') consulta.push(u);
  }

  return { admins, consulta };
}

export function getUsersByRole(users: User[], role: UserRole, onlyActive = true): User[] {
  return users.filter(u => u.role === role && (!onlyActive || u.isActive));
}

export function isAdmin(user: User | null | undefined): boolean {
  return !!user && user.role === 'Administrador' && user.isActive;
}

