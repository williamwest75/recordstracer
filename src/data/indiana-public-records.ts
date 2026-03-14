import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const IN_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "in_sos_corps", name: "Business Entity Search", agency: "IN Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://bsd.sos.in.gov/PublicBusinessSearch?SearchType=ByName&SearchTerm=${name}" },
  { id: "in_courts", name: "Court Case Search (Odyssey)", agency: "IN Courts", description: "Civil, criminal, and family court records", searchUrl: "https://public.courts.in.gov/mycase/#/vw/Search", icon: "Gavel" },
  { id: "in_doc", name: "Offender Search", agency: "IN DOC", description: "Current inmates in Indiana state prisons", searchUrl: "https://www.in.gov/idoc/offender-locator/", icon: "ShieldAlert" },
  { id: "in_sex_offenders", name: "Sex Offender Registry", agency: "IN State Police", description: "Registered sex offenders in Indiana", searchUrl: "https://www.icrimewatch.net/indiana.php", icon: "AlertTriangle" },
  { id: "in_voter", name: "Voter Registration", agency: "IN Secretary of State", description: "Voter registration status", searchUrl: "https://indianavoters.in.gov/", icon: "Vote" },
  { id: "in_ucc", name: "UCC Filings", agency: "IN Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://bsd.sos.in.gov/PublicUccSearch", icon: "FileText" },
];

export const IN_LICENSE_SOURCES: RecordSource[] = [
  { id: "in_pla", name: "Professional License Lookup", agency: "IN PLA", description: "Doctors, nurses, real estate, and more", searchUrl: "https://mylicense.in.gov/EVerification/Search.aspx", icon: "Briefcase" },
  { id: "in_bar", name: "Attorney Search", agency: "IN Supreme Court", description: "Licensed attorneys in Indiana", searchUrl: "https://courtapps.in.gov/rollofattorneys/", icon: "Scale" },
];

export const IN_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "in_sos_cf", name: "IN Campaign Finance", agency: "IN Secretary of State", description: "Campaign contributions and expenditures", searchUrl: "https://campaignfinance.in.gov/PublicSite/SearchPages/SearchByCandidate.aspx", icon: "Vote" },
];

export const IN_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Marion", label: "Marion County", url: "https://www.indy.gov/agency/assessor" },
  { county: "Lake", label: "Lake County", url: "https://www.lakecountyin.org/departments/assessor/" },
  { county: "Allen", label: "Allen County", url: "https://www.allencountyassessor.us/" },
  { county: "Hamilton", label: "Hamilton County", url: "https://www.hamiltoncounty.in.gov/211/Assessors-Office" },
  { county: "St. Joseph", label: "St. Joseph County", url: "https://www.sjcassessor.us/" },
  { county: "Elkhart", label: "Elkhart County", url: "https://www.elkhartcounty.com/departments/assessor/" },
];
