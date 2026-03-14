import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const MO_STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "mo_sos_corps",
    name: "Business Entity Search",
    agency: "MO Secretary of State",
    description: "Corporations, LLCs, LPs, and trade names",
    searchUrl: "",
    icon: "Building2",
    deepLinkable: true,
    urlTemplate: "https://bsd.sos.mo.gov/BusinessEntity/BESearch.aspx?SearchType=0&SearchTerm=${name}",
  },
  {
    id: "mo_casenet",
    name: "Court Case Search (CaseNet)",
    agency: "MO Courts",
    description: "Statewide court case records",
    searchUrl: "",
    icon: "Gavel",
    deepLinkable: true,
    urlTemplate: "https://www.courts.mo.gov/cnet/cases/newHeaderData.do?searchType=name&inputVO.lastName=${name}",
  },
  {
    id: "mo_doc",
    name: "Offender Search",
    agency: "MO DOC",
    description: "Current and released offenders in Missouri",
    searchUrl: "https://doc.mo.gov/media-center/offender-search",
    icon: "ShieldAlert",
  },
  {
    id: "mo_sex_offenders",
    name: "Sex Offender Registry",
    agency: "MO Highway Patrol",
    description: "Registered sex offenders in Missouri",
    searchUrl: "https://www.mshp.dps.missouri.gov/CJ38/search",
    icon: "AlertTriangle",
  },
  {
    id: "mo_voter",
    name: "Voter Registration",
    agency: "MO Secretary of State",
    description: "Voter registration status lookup",
    searchUrl: "https://s1.sos.mo.gov/elections/voterlookup/",
    icon: "Vote",
  },
  {
    id: "mo_ucc",
    name: "UCC Filings",
    agency: "MO Secretary of State",
    description: "Uniform Commercial Code financing statements",
    searchUrl: "https://www.sos.mo.gov/ucc/search",
    icon: "FileText",
  },
];

export const MO_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "mo_pr",
    name: "Professional License Lookup",
    agency: "MO Division of Professional Registration",
    description: "Doctors, nurses, contractors, real estate, and more",
    searchUrl: "https://pr.mo.gov/licensee-search.asp",
    icon: "Briefcase",
  },
  {
    id: "mo_bar",
    name: "Attorney Search",
    agency: "Missouri Bar",
    description: "Licensed attorneys in Missouri",
    searchUrl: "https://mobar.org/public/LegalResources/Find-a-Lawyer.aspx",
    icon: "Scale",
  },
];

export const MO_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    id: "mo_ethics_cf",
    name: "MO Campaign Finance",
    agency: "MO Ethics Commission",
    description: "Campaign contributions and expenditure reports",
    searchUrl: "https://mec.mo.gov/MEC/Campaign_Finance/CF_SearchLookup.aspx",
    icon: "Vote",
  },
  {
    id: "mo_lobbyist",
    name: "MO Lobbyist Search",
    agency: "MO Ethics Commission",
    description: "Registered lobbyists and their principals",
    searchUrl: "https://mec.mo.gov/MEC/Lobbying/Lobbying_Reporting.aspx",
    icon: "Building2",
  },
];

export const MO_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "St. Louis County", label: "St. Louis County", url: "https://revenue.stlouisco.com/ias/" },
  { county: "Jackson", label: "Jackson County", url: "https://www.jacksongov.org/423/Property-Search" },
  { county: "St. Louis City", label: "St. Louis City", url: "https://www.stlouis-mo.gov/government/departments/assessor/" },
  { county: "St. Charles", label: "St. Charles County", url: "https://www.sccmo.org/assessor" },
  { county: "Greene", label: "Greene County", url: "https://greenecountymo.gov/assessor/" },
  { county: "Clay", label: "Clay County", url: "https://www.claycountymo.tax/" },
];
