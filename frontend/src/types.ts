export type IssueStatus = 'open' | 'investigating' | 'closed';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueReason = 
  | 'poss_kassa_siradan_cixdigi_zaman'
  | 'nba_tokeni_siradan_cixdigi_zaman'
  | 'azsmart_tokeni_siradan_cixdigi_zaman'
  | 'encore_db_baglanti_problemi'
  | 'internet_baglantisi_problemi'
  | 'meraki_router_siradan_cixdigi_zaman'
  | 'elektrik_kesintisi';

export interface Issue {
  id: string;
  title: string;
  description: string;
  storeCode?: string;
  status: IssueStatus;
  severity: IssueSeverity;
  reason: IssueReason;
  createdById?: string;
  createdByUsername?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  endedAt?: string;
}
