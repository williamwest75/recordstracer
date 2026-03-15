import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const IA_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "ia_sos_corps", name: "Business Entity Search", agency: "IA Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://sos.iowa.gov/search/business/(S(0))/search.aspx?term=${name}" },
  { id: "ia_courts", name: "Court Case Search", agency: "IA Judicial Branch", description: "Civil, criminal, and family court records", searchUrl: "https://www.iowacourts.gov/iowa-courts/for-the-public/", icon: "Gavel" },
  { id: "ia_doc", name: "Offender Search", agency: "IA DOC", description: "Current inmates in Iowa state prisons", searchUrl: "https://doc.iowa.gov/offender-search", icon: "ShieldAlert" },
  { id: "ia_sex_offenders", name: "Sex Offender Registry", agency: "IA DPS", description: "Registered sex offenders in Iowa", searchUrl: "https://www.iowasexoffender.gov/", icon: "AlertTriangle" },
  { id: "ia_voter", name: "Voter Registration", agency: "IA Secretary of State", description: "Voter registration status", searchUrl: "https://sos.iowa.gov/elections/voterinformation/voterregistrationstatus.aspx", icon: "Vote" },
  { id: "ia_ucc", name: "UCC Filings", agency: "IA Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://sos.iowa.gov/search/ucc/search.aspx", icon: "FileText" },
];

export const IA_LICENSE_SOURCES: RecordSource[] = [
  { id: "ia_idph", name: "Professional License Lookup", agency: "IA DPH / IBOL", description: "Doctors, nurses, and various professional licenses", searchUrl: "https://eservices.iowa.gov/licensediniowa/", icon: "Briefcase" },
  { id: "ia_bar", name: "Attorney Search", agency: "IA Judicial Branch", description: "Licensed attorneys in Iowa", searchUrl: "https://www.iardc.org/lawyersearch.asp", icon: "Scale" },
];

export const IA_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "ia_ethics_cf", name: "IA Campaign Finance", agency: "IA Ethics & Campaign Disclosure Board", description: "Campaign contributions and expenditures", searchUrl: "https://webapp.iecdb.iowa.gov/publicview/", icon: "Vote" },
];

export const IA_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Polk", label: "Polk County Assessor", url: "https://www.assess.co.polk.ia.us/" },
  { county: "Linn", label: "Linn County Assessor", url: "https://www.linncountyiowa.gov/149/Assessor" },
  { county: "Scott", label: "Scott County Assessor", url: "https://www.scottcountyiowa.gov/assessor" },
  { county: "Johnson", label: "Johnson County Assessor", url: "https://www.johnsoncountyiowa.gov/assessor" },
  { county: "Black Hawk", label: "Black Hawk County", url: "https://www.blackhawkcountyiowa.gov/assessor" },
];
