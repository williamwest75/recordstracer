import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const RI_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "ri_sos_corps", name: "Business Entity Search", agency: "RI Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://business.sos.ri.gov/CorpWeb/CorpSearch/CorpSearch.aspx?searchterm=${name}" },
  { id: "ri_courts", name: "Court Case Search", agency: "RI Judiciary", description: "Civil, criminal, and family court records", searchUrl: "https://www.courts.ri.gov/Courts/Pages/default.aspx", icon: "Gavel" },
  { id: "ri_doc", name: "Inmate Search", agency: "RI DOC", description: "Current inmates in Rhode Island facilities", searchUrl: "https://vinelink.vineapps.com/search/RI/Person", icon: "ShieldAlert" },
  { id: "ri_sex_offenders", name: "Sex Offender Registry", agency: "RI DCYF / RISP", description: "Registered sex offenders in Rhode Island", searchUrl: "https://www.risorp.ri.gov/", icon: "AlertTriangle" },
  { id: "ri_voter", name: "Voter Registration", agency: "RI Board of Elections", description: "Voter registration status", searchUrl: "https://vote.sos.ri.gov/Home/UpdateVoterRecord", icon: "Vote" },
  { id: "ri_ucc", name: "UCC Filings", agency: "RI Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://business.sos.ri.gov/CorpWeb/UCCSearch/UCCSearch.aspx", icon: "FileText" },
];

export const RI_LICENSE_SOURCES: RecordSource[] = [
  { id: "ri_health", name: "Professional License Lookup", agency: "RI Dept. of Health", description: "Various health professional licenses", searchUrl: "https://healthri.mylicense.com/Verification/Search.aspx", icon: "Stethoscope" },
  { id: "ri_bar", name: "Attorney Search", agency: "RI Bar Association", description: "Licensed attorneys in Rhode Island", searchUrl: "https://www.ribar.com/find-a-lawyer/", icon: "Scale" },
];

export const RI_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "ri_boe_cf", name: "RI Campaign Finance", agency: "RI Board of Elections", description: "Campaign contributions and expenditures", searchUrl: "https://ricampaignfinance.com/RIPublic/", icon: "Vote" },
];

export const RI_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Providence", label: "City of Providence", url: "https://www.providenceri.gov/tax-assessor/" },
  { county: "Warwick", label: "City of Warwick", url: "https://www.warwickri.gov/tax-assessors-office" },
  { county: "Cranston", label: "City of Cranston", url: "https://www.cranstonri.gov/assessor/" },
  { county: "Pawtucket", label: "City of Pawtucket", url: "https://www.pawtucketri.com/tax-assessor" },
];
