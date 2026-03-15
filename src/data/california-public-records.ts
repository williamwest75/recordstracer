import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const CA_STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "ca_sos_corps",
    name: "Business Entity Search",
    agency: "CA Secretary of State",
    description: "Corporations, LLCs, LPs, and general partnerships",
    searchUrl: "",
    icon: "Building2",
    deepLinkable: true,
    urlTemplate: "https://bizfileonline.sos.ca.gov/search/business?searchType=CORP&searchCriteria=${name}",
  },
  {
    id: "ca_courts",
    name: "Court Case Search",
    agency: "CA Courts",
    description: "Superior court case information across California",
    searchUrl: "https://www.courts.ca.gov/find-my-court.htm",
    icon: "Gavel",
  },
  {
    id: "ca_cdcr",
    name: "Inmate Locator",
    agency: "CA CDCR",
    description: "California state prison inmates",
    searchUrl: "https://inmatelocator.cdcr.ca.gov/",
    icon: "ShieldAlert",
  },
  {
    id: "ca_megan",
    name: "Sex Offender Registry",
    agency: "CA DOJ (Megan's Law)",
    description: "Registered sex offenders in California",
    searchUrl: "https://www.meganslaw.ca.gov/",
    icon: "AlertTriangle",
  },
  {
    id: "ca_voter",
    name: "Voter Registration",
    agency: "CA Secretary of State",
    description: "Voter registration status verification",
    searchUrl: "https://www.sos.ca.gov/elections/voter-registration/check-voter-registration",
    icon: "Vote",
  },
  {
    id: "ca_ucc",
    name: "UCC Filings",
    agency: "CA Secretary of State",
    description: "Uniform Commercial Code financing statements",
    searchUrl: "https://bizfileonline.sos.ca.gov/search/ucc",
    icon: "FileText",
  },
];

export const CA_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "ca_dca",
    name: "Professional License Check",
    agency: "CA DCA",
    description: "Contractors, real estate, doctors, nurses, accountants, and more",
    searchUrl: "https://search.dca.ca.gov/",
    icon: "Briefcase",
  },
  {
    id: "ca_medical_board",
    name: "Medical Board License",
    agency: "Medical Board of CA",
    description: "Physicians, surgeons, and medical license verification",
    searchUrl: "https://mbc.ca.gov/breeze/",
    icon: "Stethoscope",
  },
  {
    id: "ca_state_bar",
    name: "Attorney Search",
    agency: "State Bar of California",
    description: "Licensed attorneys and their disciplinary history",
    searchUrl: "",
    icon: "Scale",
    deepLinkable: true,
    urlTemplate: "https://apps.calbar.ca.gov/attorney/LicenseeSearch/QuickSearch?FreeText=${name}",
  },
];

export const CA_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    id: "ca_cal_access",
    name: "CA Campaign Finance (Cal-Access)",
    agency: "CA Secretary of State",
    description: "State campaign contributions, expenditures, and lobbying",
    searchUrl: "https://cal-access.sos.ca.gov/Campaign/",
    icon: "Vote",
  },
  {
    id: "ca_lobbyist",
    name: "CA Lobbyist Directory",
    agency: "CA Secretary of State",
    description: "Registered lobbyists and lobbying firms",
    searchUrl: "https://cal-access.sos.ca.gov/Lobbying/",
    icon: "Building2",
  },
];

export const CA_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Los Angeles", label: "LA County Assessor", url: "https://portal.assessor.lacounty.gov/" },
  { county: "San Diego", label: "San Diego Assessor", url: "https://www.sandiegocounty.gov/content/sdc/assessor.html" },
  { county: "Orange", label: "OC Assessor", url: "https://www.ocgov.com/assessor" },
  { county: "San Francisco", label: "SF Assessor-Recorder", url: "https://sfassessor.org/" },
  { county: "Santa Clara", label: "Santa Clara Assessor", url: "https://www.sccassessor.org/" },
  { county: "Alameda", label: "Alameda Assessor", url: "https://www.acassessor.org/" },
  { county: "Sacramento", label: "Sacramento Assessor", url: "https://www.assessor.saccounty.gov/" },
  { county: "Riverside", label: "Riverside Assessor", url: "https://www.countyofriverside.us/government/assessor" },
];
