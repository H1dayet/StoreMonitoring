import { Issue, IssueStatus, IssueSeverity, IssueReason } from '../types';

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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create issue');
  return res.json();
}

export async function updateIssueStatus(id: string, status: IssueStatus): Promise<Issue> {
  const res = await fetch(`${BASE_URL}/issues/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function deleteIssue(id: string): Promise<Issue | undefined> {
  const res = await fetch(`${BASE_URL}/issues/${id}`, { method: 'DELETE' });
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
