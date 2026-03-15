import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const GA_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "ga_sos_corps", name: "Business Entity Search", agency: "GA Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://ecorp.sos.ga.gov/BusinessSearch?searchText=${name}" },
  { id: "ga_courts", name: "Court Case Search", agency: "GA Administrative Office of Courts", description: "Superior and state court records", searchUrl: "https://www.georgiacourts.gov/courts/case-info/", icon: "Gavel" },
  { id: "ga_doc", name: "Offender Search", agency: "GA DOC", description: "Current and past inmates in Georgia", searchUrl: "http://www.dcor.state.ga.us/OffenderSearch", icon: "ShieldAlert" },
  { id: "ga_sex_offenders", name: "Sex Offender Registry", agency: "GA GBI", description: "Registered sex offenders in Georgia", searchUrl: "https://state.sor.gbi.ga.gov/", icon: "AlertTriangle" },
  { id: "ga_voter", name: "Voter Registration", agency: "GA Secretary of State", description: "Voter registration status", searchUrl: "https://mvp.sos.ga.gov/s/", icon: "Vote" },
  { id: "ga_ucc", name: "UCC Filings", agency: "GA Superior Court Clerks' Authority", description: "Uniform Commercial Code financing statements", searchUrl: "https://www.gsccca.org/search", icon: "FileText" },
];

export const GA_LICENSE_SOURCES: RecordSource[] = [
  { id: "ga_sos_license", name: "Professional License Lookup", agency: "GA Secretary of State", description: "Various professional and occupational licenses", searchUrl: "https://verify.sos.ga.gov/verification/", icon: "Briefcase" },
  { id: "ga_bar", name: "Attorney Search", agency: "State Bar of Georgia", description: "Licensed attorneys in Georgia", searchUrl: "https://www.gabar.org/membership/membersearch.cfm", icon: "Scale" },
];

export const GA_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "ga_ethics_cf", name: "GA Campaign Finance", agency: "GA Ethics Commission", description: "Campaign contributions and expenditure reports", searchUrl: "https://media.ethics.ga.gov/search/Campaign/Campaign_ByContributions.aspx", icon: "Vote" },
];

export const GA_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Fulton", label: "Fulton County", url: "https://www.fultoncountyga.gov/services/residents/property-taxes-assessments" },
  { county: "DeKalb", label: "DeKalb County", url: "https://www.dekalbcountyga.gov/tax-assessor/property-assessment-search" },
  { county: "Gwinnett", label: "Gwinnett County", url: "https://www.gwinnettcounty.com/web/gwinnett/departments/taxcommissioner" },
  { county: "Cobb", label: "Cobb County", url: "https://www.cobbcounty.org/tax/property-tax-assessor" },
  { county: "Chatham", label: "Chatham County", url: "https://boa.chathamcounty.org/" },
  { county: "Cherokee", label: "Cherokee County", url: "https://www.cherokeega.com/Tax-Assessors-Office/" },
];
