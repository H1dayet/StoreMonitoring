export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  active: boolean;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
