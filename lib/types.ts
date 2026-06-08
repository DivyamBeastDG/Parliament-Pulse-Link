export interface Bill {
  id: string;
  title: string;
  status: 'Introduced' | 'Pending' | 'Passed' | 'Rejected';
  department: string;
  date_introduced: string;
  ai_summary_what: string;
  ai_summary_why: string;
  ai_summary_impact: string;
  document_url?: string;
}

export interface Representative {
  id: string;
  name: string;
  role: 'MLA' | 'MP';
  party: string;
  constituency: string;
  district: string;
  attendance_rate: number;
  photo_url?: string;
}