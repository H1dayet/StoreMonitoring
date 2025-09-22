import { Issue, IssueStatus, IssueSeverity, IssueReason } from '../types';
import { authHeaders } from './auth';

export interface Store { code: string; name: string }

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchIssues(): Promise<Issue[]> {
  const res = await fetch(`${BASE_URL}/issues`);
  if (!res.ok) throw new Error('Failed to fetch issues');
  return res.json();
}

export async function createIssue(body: { title: string; description?: string; severity?: IssueSeverity; reason: IssueReason; storeCode: string; }): Promise<Issue> {
  const res = await fetch(`${BASE_URL}/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create issue');
  return res.json();
}

export async function updateIssueStatus(id: string, status: IssueStatus): Promise<Issue> {
  const res = await fetch(`${BASE_URL}/issues/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function deleteIssue(id: string): Promise<Issue | undefined> {
  const res = await fetch(`${BASE_URL}/issues/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to delete issue');
  // Some servers return 204; handle both 200 and 204
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

export async function fetchStores(): Promise<Store[]> {
  const res = await fetch(`${BASE_URL}/stores`);
  if (!res.ok) throw new Error('Failed to fetch stores');
  return res.json();
}

export async function createStore(data: { code: string; name: string }): Promise<Store> {
  const res = await fetch(`${BASE_URL}/stores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add store');
  return res.json();
}

export async function deleteStoreApi(code: string): Promise<{ deleted: boolean }> {
  const res = await fetch(`${BASE_URL}/stores/${encodeURIComponent(code)}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete store');
  return res.json();
}

// Admin: Users API (protected)
export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function adminLogin(username: string, password: string): Promise<{ token: string; user: { id: string; username: string; role: 'admin' | 'user'; name: string; active: boolean } }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}

export async function fetchUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${BASE_URL}/admin/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function createUser(data: { username: string; name: string; password: string; role: 'admin' | 'user'; active?: boolean; }): Promise<AdminUser> {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}

