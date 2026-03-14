import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const OR_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "or_sos_corps", name: "Business Entity Search", agency: "OR Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://egov.sos.state.or.us/br/pkg_web_name_srch_inq.login?p_name=${name}" },
  { id: "or_courts", name: "Court Case Search (OJCIN)", agency: "OR Judicial Dept.", description: "Circuit court case records", searchUrl: "https://www.courts.oregon.gov/services/online/Pages/ojcin.aspx", icon: "Gavel" },
  { id: "or_doc", name: "Offender Search", agency: "OR DOC", description: "Current inmates in Oregon facilities", searchUrl: "https://docpub.state.or.us/OOS/intro.jsf", icon: "ShieldAlert" },
  { id: "or_sex_offenders", name: "Sex Offender Registry", agency: "OR State Police", description: "Registered sex offenders in Oregon", searchUrl: "https://sexoffenders.oregon.gov/", icon: "AlertTriangle" },
  { id: "or_voter", name: "Voter Registration", agency: "OR Secretary of State", description: "Voter registration status", searchUrl: "https://sos.oregon.gov/voting/Pages/myvote.aspx", icon: "Vote" },
  { id: "or_ucc", name: "UCC Filings", agency: "OR Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://sos.oregon.gov/business/Pages/find.aspx", icon: "FileText" },
];

export const OR_LICENSE_SOURCES: RecordSource[] = [
  { id: "or_omb", name: "Medical License Verification", agency: "OR Medical Board", description: "Physicians licensed in Oregon", searchUrl: "https://omb.oregon.gov/search", icon: "Stethoscope" },
  { id: "or_bar", name: "Attorney Search", agency: "OR State Bar", description: "Licensed attorneys in Oregon", searchUrl: "https://www.osbar.org/members/membersearch.asp", icon: "Scale" },
];

export const OR_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "or_sos_cf", name: "OR Campaign Finance (ORESTAR)", agency: "OR Secretary of State", description: "Campaign contributions and expenditures", searchUrl: "https://secure.sos.state.or.us/orestar/GotoSearchByName.do", icon: "Vote" },
];

export const OR_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Multnomah", label: "Multnomah County", url: "https://multcoproptax.com/" },
  { county: "Washington", label: "Washington County", url: "https://www.washingtoncountyor.gov/at/property-assessment-taxation" },
  { county: "Clackamas", label: "Clackamas County", url: "https://www.clackamas.us/at/" },
  { county: "Lane", label: "Lane County", url: "https://www.lanecounty.org/government/county_departments/assessment_and_taxation" },
  { county: "Marion", label: "Marion County", url: "https://www.co.marion.or.us/AO" },
  { county: "Jackson", label: "Jackson County", url: "https://www.jacksoncountyor.gov/assessor" },
];
