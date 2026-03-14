import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const KY_STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "ky_sos_corps",
    name: "Business Entity Search",
    agency: "KY Secretary of State",
    description: "Corporations, LLCs, LPs, and assumed names",
    searchUrl: "",
    icon: "Building2",
    deepLinkable: true,
    urlTemplate: "https://web.sos.ky.gov/bussearchnew/search?searchType=b&searchTerm=${name}",
  },
  {
    id: "ky_courts",
    name: "Court Case Search (CourtNet)",
    agency: "KY Court of Justice",
    description: "Civil, criminal, and family court records",
    searchUrl: "https://kcoj.kycourts.net/",
    icon: "Gavel",
  },
  {
    id: "ky_doc",
    name: "Offender Search (KOOL)",
    agency: "KY DOC",
    description: "Current and released inmates in Kentucky",
    searchUrl: "https://kool.corrections.ky.gov/KOOL/",
    icon: "ShieldAlert",
  },
  {
    id: "ky_sex_offenders",
    name: "Sex Offender Registry",
    agency: "KY State Police",
    description: "Registered sex offenders in Kentucky",
    searchUrl: "https://kspsor.state.ky.us/",
    icon: "AlertTriangle",
  },
  {
    id: "ky_voter",
    name: "Voter Registration",
    agency: "KY State Board of Elections",
    description: "Voter registration status lookup",
    searchUrl: "https://vrsws.sos.ky.gov/vic/",
    icon: "Vote",
  },
  {
    id: "ky_ucc",
    name: "UCC Filings",
    agency: "KY Secretary of State",
    description: "Uniform Commercial Code financing statements",
    searchUrl: "https://web.sos.ky.gov/uccsearch/",
    icon: "FileText",
  },
];

export const KY_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "ky_medical_board",
    name: "Medical License Verification",
    agency: "KY Board of Medical Licensure",
    description: "Physicians and physician assistants licensed in KY",
    searchUrl: "https://web1.ky.gov/GenSearch/LicenseSearch.aspx?AGY=5",
    icon: "Stethoscope",
  },
  {
    id: "ky_bar",
    name: "Attorney Search",
    agency: "KY Bar Association",
    description: "Licensed attorneys in Kentucky",
    searchUrl: "https://www.kybar.org/search/custom.asp?id=2948",
    icon: "Scale",
  },
];

export const KY_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    id: "ky_registry_cf",
    name: "KY Campaign Finance",
    agency: "KY Registry of Election Finance",
    description: "Campaign contributions and expenditure reports",
    searchUrl: "https://secure.kentucky.gov/kref/publicsearch/",
    icon: "Vote",
  },
  {
    id: "ky_lobbyist",
    name: "KY Lobbyist Search",
    agency: "KY Legislative Ethics Commission",
    description: "Registered lobbyists and their employers",
    searchUrl: "https://klec.ky.gov/Reports/Pages/default.aspx",
    icon: "Building2",
  },
];

export const KY_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Jefferson", label: "Jefferson County PVA", url: "https://jeffersonpva.ky.gov/" },
  { county: "Fayette", label: "Fayette County PVA", url: "https://fayettepva.com/" },
  { county: "Kenton", label: "Kenton County PVA", url: "https://www.kentoncounty.org/167/Property-Valuation" },
  { county: "Boone", label: "Boone County PVA", url: "https://www.boonecountypva.com/" },
  { county: "Warren", label: "Warren County PVA", url: "https://warrencountypva.com/" },
  { county: "Hardin", label: "Hardin County PVA", url: "https://www.hardincountypva.com/" },
];
