import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const NE_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "ne_sos_corps", name: "Business Entity Search", agency: "NE Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://www.nebraska.gov/sos/corp/corpsearch.cgi?nav=search&srch_nme=${name}" },
  { id: "ne_courts", name: "Court Case Search (JUSTICE)", agency: "NE Judicial Branch", description: "Civil, criminal, and county court records", searchUrl: "https://www.nebraska.gov/justice/case-search.cgi", icon: "Gavel" },
  { id: "ne_doc", name: "Inmate Search", agency: "NE DCS", description: "Current inmates in Nebraska facilities", searchUrl: "https://doc.nebraska.gov/search", icon: "ShieldAlert" },
  { id: "ne_sex_offenders", name: "Sex Offender Registry", agency: "NE State Patrol", description: "Registered sex offenders in Nebraska", searchUrl: "https://sor.nebraska.gov/", icon: "AlertTriangle" },
  { id: "ne_voter", name: "Voter Registration", agency: "NE Secretary of State", description: "Voter registration status", searchUrl: "https://www.votercheck.necvr.ne.gov/voterview", icon: "Vote" },
  { id: "ne_ucc", name: "UCC Filings", agency: "NE Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://www.nebraska.gov/sos/ucc/uccsearch.cgi", icon: "FileText" },
];

export const NE_LICENSE_SOURCES: RecordSource[] = [
  { id: "ne_dhhs", name: "Professional License Lookup", agency: "NE DHHS", description: "Various professional and occupational licenses", searchUrl: "https://www.nebraska.gov/LISSearch/search.cgi", icon: "Briefcase" },
  { id: "ne_bar", name: "Attorney Search", agency: "NE State Bar Association", description: "Licensed attorneys in Nebraska", searchUrl: "https://www.nebar.com/search/custom.asp?id=2592", icon: "Scale" },
];

export const NE_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "ne_nadc_cf", name: "NE Campaign Finance", agency: "NE Accountability & Disclosure Commission", description: "Campaign contributions and expenditures", searchUrl: "https://nadc.nebraska.gov/campaign-finance/search", icon: "Vote" },
];

export const NE_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Douglas", label: "Douglas County Assessor", url: "https://www.douglascounty-ne.gov/assessor/" },
  { county: "Lancaster", label: "Lancaster County Assessor", url: "https://www.lancaster.ne.gov/assessor" },
  { county: "Sarpy", label: "Sarpy County Assessor", url: "https://www.sarpy.com/assessor" },
  { county: "Hall", label: "Hall County Assessor", url: "https://www.hallcounty.org/assessor" },
];
