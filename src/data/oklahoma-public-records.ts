import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const OK_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "ok_sos_corps", name: "Business Entity Search", agency: "OK Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://www.sos.ok.gov/corp/corpInquiryFind.aspx?searchTerm=${name}" },
  { id: "ok_oscn", name: "Court Case Search (OSCN)", agency: "OK Supreme Court Network", description: "Civil, criminal, and appellate court records", searchUrl: "https://www.oscn.net/dockets/Search.aspx", icon: "Gavel" },
  { id: "ok_doc", name: "Offender Search", agency: "OK DOC", description: "Current inmates in Oklahoma facilities", searchUrl: "https://okoffender.doc.ok.gov/", icon: "ShieldAlert" },
  { id: "ok_sex_offenders", name: "Sex Offender Registry", agency: "OK DPS", description: "Registered sex offenders in Oklahoma", searchUrl: "https://sors.doc.ok.gov/", icon: "AlertTriangle" },
  { id: "ok_voter", name: "Voter Registration", agency: "OK State Election Board", description: "Voter registration status", searchUrl: "https://okvoterportal.okelections.us/", icon: "Vote" },
  { id: "ok_ucc", name: "UCC Filings", agency: "OK County Clerk", description: "Uniform Commercial Code financing statements", searchUrl: "https://www.sos.ok.gov/ucc/search.aspx", icon: "FileText" },
];

export const OK_LICENSE_SOURCES: RecordSource[] = [
  { id: "ok_medical", name: "Medical License Verification", agency: "OK Medical Board", description: "Physicians licensed in Oklahoma", searchUrl: "https://www.okmedicalboard.org/search", icon: "Stethoscope" },
  { id: "ok_bar", name: "Attorney Search", agency: "OK Bar Association", description: "Licensed attorneys in Oklahoma", searchUrl: "https://www.okbar.org/freelegalinfo/findanattorney/", icon: "Scale" },
];

export const OK_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "ok_ethics_cf", name: "OK Campaign Finance", agency: "OK Ethics Commission", description: "Campaign contributions and expenditures", searchUrl: "https://guardian.ok.gov/PublicSite/SearchPages/default.aspx", icon: "Vote" },
];

export const OK_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Oklahoma", label: "Oklahoma County Assessor", url: "https://assessor.oklahomacounty.org/" },
  { county: "Tulsa", label: "Tulsa County Assessor", url: "https://assessor.tulsacounty.org/" },
  { county: "Cleveland", label: "Cleveland County Assessor", url: "https://www.clevelandcountyassessor.us/" },
  { county: "Canadian", label: "Canadian County Assessor", url: "https://www.canadiancounty.us/assessor/" },
  { county: "Comanche", label: "Comanche County Assessor", url: "https://www.comanchecountyok.us/assessor" },
];
