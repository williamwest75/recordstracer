import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const MN_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "mn_sos_corps", name: "Business Entity Search", agency: "MN Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://mblsportal.sos.state.mn.us/Business/Search?BusinessName=${name}" },
  { id: "mn_courts", name: "Court Case Search (MNCIS)", agency: "MN Judicial Branch", description: "Civil, criminal, and family court records", searchUrl: "https://publicaccess.courts.state.mn.us/CaseSearch", icon: "Gavel" },
  { id: "mn_doc", name: "Offender Search", agency: "MN DOC", description: "Current inmates and supervised offenders", searchUrl: "https://coms.doc.state.mn.us/PublicViewer", icon: "ShieldAlert" },
  { id: "mn_sex_offenders", name: "Sex Offender Registry", agency: "MN BCA", description: "Registered sex offenders in Minnesota", searchUrl: "https://coms.doc.state.mn.us/publicportal/", icon: "AlertTriangle" },
  { id: "mn_voter", name: "Voter Registration", agency: "MN Secretary of State", description: "Voter registration status", searchUrl: "https://mnvotes.sos.mn.gov/VoterStatus.aspx", icon: "Vote" },
  { id: "mn_ucc", name: "UCC Filings", agency: "MN Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://mblsportal.sos.state.mn.us/UCC/Search", icon: "FileText" },
];

export const MN_LICENSE_SOURCES: RecordSource[] = [
  { id: "mn_health", name: "Medical License Verification", agency: "MN Board of Medical Practice", description: "Physicians licensed in Minnesota", searchUrl: "https://mn.gov/boards/medical-practice/public/licensee-lookup/", icon: "Stethoscope" },
  { id: "mn_bar", name: "Attorney Search", agency: "MN Judicial Branch", description: "Licensed attorneys in Minnesota", searchUrl: "https://www.mnbar.org/member-directory/find-a-lawyer", icon: "Scale" },
];

export const MN_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "mn_cfb", name: "MN Campaign Finance", agency: "MN Campaign Finance Board", description: "Campaign contributions and expenditures", searchUrl: "https://cfb.mn.gov/reports-data/viewers/campaign-finance/", icon: "Vote" },
];

export const MN_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Hennepin", label: "Hennepin County", url: "https://www.hennepin.us/residents/property/property-information-search" },
  { county: "Ramsey", label: "Ramsey County", url: "https://www.ramseycounty.us/residents/property/property-search" },
  { county: "Dakota", label: "Dakota County", url: "https://www.co.dakota.mn.us/HomeProperty/PropertyInformation/" },
  { county: "Anoka", label: "Anoka County", url: "https://www.anokacounty.us/government/property/property-information" },
  { county: "Washington", label: "Washington County", url: "https://www.washingtoncountymn.gov/427/Property-Information" },
  { county: "St. Louis", label: "St. Louis County", url: "https://www.stlouiscountymn.gov/departments-a-z/assessor" },
];
