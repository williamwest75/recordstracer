import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const SC_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "sc_sos_corps", name: "Business Entity Search", agency: "SC Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://businessfilings.sc.gov/BusinessFiling/Entity/Search?searchTerm=${name}" },
  { id: "sc_courts", name: "Court Case Search", agency: "SC Judicial Dept.", description: "Circuit court case records", searchUrl: "https://www.sccourts.org/caseSearch/", icon: "Gavel" },
  { id: "sc_doc", name: "Inmate Search", agency: "SC DOC", description: "Current inmates in South Carolina", searchUrl: "https://public.doc.state.sc.us/scdc-public/", icon: "ShieldAlert" },
  { id: "sc_sex_offenders", name: "Sex Offender Registry", agency: "SC SLED", description: "Registered sex offenders in South Carolina", searchUrl: "https://www.sled.sc.gov/SexOffender.aspx", icon: "AlertTriangle" },
  { id: "sc_voter", name: "Voter Registration", agency: "SC Election Commission", description: "Voter registration status", searchUrl: "https://www.scvotes.gov/information-voters/voter-registration-verification", icon: "Vote" },
  { id: "sc_ucc", name: "UCC Filings", agency: "SC Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://businessfilings.sc.gov/BusinessFiling/UCC/", icon: "FileText" },
];

export const SC_LICENSE_SOURCES: RecordSource[] = [
  { id: "sc_llr", name: "Professional License Lookup", agency: "SC LLR", description: "Various professional and occupational licenses", searchUrl: "https://www.llronline.com/POL/Search.aspx", icon: "Briefcase" },
  { id: "sc_bar", name: "Attorney Search", agency: "SC Bar", description: "Licensed attorneys in South Carolina", searchUrl: "https://www.scbar.org/public/find-a-lawyer/", icon: "Scale" },
];

export const SC_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "sc_ethics_cf", name: "SC Campaign Finance", agency: "SC Ethics Commission", description: "Campaign contributions and expenditures", searchUrl: "https://ethics.sc.gov/reports/", icon: "Vote" },
];

export const SC_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Greenville", label: "Greenville County", url: "https://www.greenvillecounty.org/tax_collector/" },
  { county: "Richland", label: "Richland County", url: "https://www.richlandonline.com/Government/Departments/Assessor" },
  { county: "Charleston", label: "Charleston County", url: "https://www.charlestoncounty.org/departments/assessor/" },
  { county: "Horry", label: "Horry County", url: "https://www.horrycounty.org/Departments/Assessor" },
  { county: "Spartanburg", label: "Spartanburg County", url: "https://www.spartanburgcounty.org/government/departments/assessor" },
];
