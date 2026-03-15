import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const ID_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "id_sos_corps", name: "Business Entity Search", agency: "ID Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://sosbiz.idaho.gov/search/business?name=${name}" },
  { id: "id_courts", name: "Court Case Search (iCourt)", agency: "ID Judiciary", description: "Civil, criminal, and family court records", searchUrl: "https://mycourts.idaho.gov/", icon: "Gavel" },
  { id: "id_doc", name: "Offender Search", agency: "ID DOC", description: "Current inmates and supervised offenders", searchUrl: "https://www.idoc.idaho.gov/content/prisons/offender_search", icon: "ShieldAlert" },
  { id: "id_sex_offenders", name: "Sex Offender Registry", agency: "ID State Police", description: "Registered sex offenders in Idaho", searchUrl: "https://isp.idaho.gov/sor_id/", icon: "AlertTriangle" },
  { id: "id_voter", name: "Voter Registration", agency: "ID Secretary of State", description: "Voter registration status", searchUrl: "https://elections.sos.idaho.gov/ElectionLink/ElectionLink/VoterSearch.aspx", icon: "Vote" },
  { id: "id_ucc", name: "UCC Filings", agency: "ID Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://sosbiz.idaho.gov/search/ucc", icon: "FileText" },
];

export const ID_LICENSE_SOURCES: RecordSource[] = [
  { id: "id_ibol", name: "Professional License Lookup", agency: "ID IBOL", description: "Various professional and occupational licenses", searchUrl: "https://ibol.idaho.gov/IBOL/LPRBrowser.aspx", icon: "Briefcase" },
  { id: "id_bar", name: "Attorney Search", agency: "ID State Bar", description: "Licensed attorneys in Idaho", searchUrl: "https://isb.idaho.gov/for-the-public/attorney-roster/", icon: "Scale" },
];

export const ID_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "id_sos_cf", name: "ID Campaign Finance", agency: "ID Secretary of State", description: "Campaign contributions and expenditures", searchUrl: "https://elections.sos.idaho.gov/ElectionLink/ElectionLink/CandidateSearch.aspx", icon: "Vote" },
];

export const ID_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Ada", label: "Ada County Assessor", url: "https://www.adacounty.id.gov/assessor/" },
  { county: "Canyon", label: "Canyon County Assessor", url: "https://www.canyoncounty.id.gov/elected-officials/assessor" },
  { county: "Kootenai", label: "Kootenai County Assessor", url: "https://www.kcgov.us/departments/assessor" },
  { county: "Bonneville", label: "Bonneville County Assessor", url: "https://www.bonnevillecounty.org/departments/assessor" },
];
