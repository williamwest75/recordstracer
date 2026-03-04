export interface DossierContribution {
  contributor_name: string;
  contributor_city: string;
  contributor_state: string;
  contributor_employer: string;
  contributor_occupation: string;
  committee_name: string;
  committee_id: string;
  candidate_name: string | null;
  amount: number;
  date: string;
  receipt_type_description: string;
  fec_url: string | null;
}

export interface DossierFecData {
  source: string;
  query: string;
  state: string;
  total_results: number;
  returned_results: number;
  summary: {
    total_amount: number;
    contribution_count: number;
    unique_committees: number;
    unique_candidates: number;
    top_recipients: { name: string; total: number }[];
    date_range: { earliest: string | null; latest: string | null } | null;
  };
  contributions: DossierContribution[];
}

export interface DossierDocket {
  case_name: string;
  docket_number: string;
  court: string;
  date_filed: string | null;
  date_terminated: string | null;
  suit_nature: string;
  assigned_to: string;
  cause: string;
  url: string | null;
  docket_id: string | null;
  snippet: string;
}

export interface DossierOpinion {
  case_name: string;
  court: string;
  date_filed: string | null;
  citation: string;
  status: string;
  url: string | null;
  snippet: string;
}

export interface DossierCourtData {
  source: string;
  query: string;
  dockets: {
    total_count: number;
    returned: number;
    results: DossierDocket[];
  };
  opinions: {
    total_count: number;
    returned: number;
    results: DossierOpinion[];
  };
}

export interface DossierBriefData {
  brief: string;
  searchName: string;
  data_sources: {
    fec: boolean;
    court_dockets: boolean;
    court_opinions: boolean;
    news: boolean;
  };
}

export interface TimelineEvent {
  date: string;
  type: "donation" | "court" | "news";
  title: string;
  detail: string;
  url: string | null;
  amount?: number;
}
