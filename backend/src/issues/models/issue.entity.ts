export type IssueStatus = 'open' | 'investigating' | 'closed';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

// Single source of truth for reason identifiers (machine-readable). Do not translate these.
export const ISSUE_REASONS = [
  'poss_kassa_siradan_cixdigi_zaman',
  'nba_tokeni_siradan_cixdigi_zaman',
  'azsmart_tokeni_siradan_cixdigi_zaman',
  'encore_db_baglanti_problemi',
  'internet_baglantisi_problemi',
  'meraki_router_siradan_cixdigi_zaman',
  'elektrik_kesintisi',
] as const;
export type IssueReason = typeof ISSUE_REASONS[number];

export interface Issue {
  id: string;
  title: string;
  description: string;
  storeCode?: string; // optional store code referencing stores.data
  status: IssueStatus;
  severity: IssueSeverity;
  reason: IssueReason;
  createdAt: Date;
  updatedAt: Date;
  // When the issue is resolved/closed, this marks the end of downtime
  endedAt?: Date;
}
