import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const MD_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "md_sdat_corps", name: "Business Entity Search", agency: "MD SDAT", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://egov.maryland.gov/BusinessExpress/EntitySearch/Search?keyword=${name}" },
  { id: "md_courts", name: "Court Case Search", agency: "MD Judiciary", description: "Circuit and district court records", searchUrl: "https://casesearch.courts.state.md.us/casesearch/", icon: "Gavel" },
  { id: "md_doc", name: "Inmate Search", agency: "MD DPSCS", description: "Current inmates in Maryland facilities", searchUrl: "https://www.dpscs.state.md.us/inmate/", icon: "ShieldAlert" },
  { id: "md_sex_offenders", name: "Sex Offender Registry", agency: "MD DPSCS", description: "Registered sex offenders in Maryland", searchUrl: "https://www.dpscs.state.md.us/sorSearch/", icon: "AlertTriangle" },
  { id: "md_voter", name: "Voter Registration", agency: "MD State Board of Elections", description: "Voter registration status", searchUrl: "https://voterservices.elections.maryland.gov/VoterSearch", icon: "Vote" },
  { id: "md_ucc", name: "UCC Filings", agency: "MD SDAT", description: "Uniform Commercial Code financing statements", searchUrl: "https://egov.maryland.gov/BusinessExpress/UCCSearch", icon: "FileText" },
];

export const MD_LICENSE_SOURCES: RecordSource[] = [
  { id: "md_health", name: "Professional License Lookup", agency: "MD DHMH", description: "Doctors, nurses, and health professionals", searchUrl: "https://mdbnc.health.maryland.gov/bphp/Pages/verify.aspx", icon: "Stethoscope" },
  { id: "md_bar", name: "Attorney Search", agency: "MD Courts", description: "Licensed attorneys in Maryland", searchUrl: "https://www.courts.state.md.us/attorneys", icon: "Scale" },
];

export const MD_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "md_sbe_cf", name: "MD Campaign Finance", agency: "MD State Board of Elections", description: "Campaign contributions and expenditures", searchUrl: "https://campaignfinance.maryland.gov/Public/ViewReceipts", icon: "Vote" },
];

export const MD_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Baltimore County", label: "Baltimore County", url: "https://www.dat.state.md.us/RealProperty/Pages/default.aspx" },
  { county: "Baltimore City", label: "Baltimore City", url: "https://www.dat.state.md.us/RealProperty/Pages/default.aspx" },
  { county: "Montgomery", label: "Montgomery County", url: "https://www.dat.state.md.us/RealProperty/Pages/default.aspx" },
  { county: "Prince George's", label: "Prince George's County", url: "https://www.dat.state.md.us/RealProperty/Pages/default.aspx" },
  { county: "Anne Arundel", label: "Anne Arundel County", url: "https://www.dat.state.md.us/RealProperty/Pages/default.aspx" },
  { county: "Howard", label: "Howard County", url: "https://www.dat.state.md.us/RealProperty/Pages/default.aspx" },
];
