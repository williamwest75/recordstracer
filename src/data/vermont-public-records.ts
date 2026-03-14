import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const VT_STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "vt_sos_corps",
    name: "Business Entity Search",
    agency: "VT Secretary of State",
    description: "Corporations, LLCs, LPs, and trade names",
    searchUrl: "",
    icon: "Building2",
    deepLinkable: true,
    urlTemplate: "https://bizfilings.vermont.gov/online/BusinessInquire/Search?searchTerm=${name}",
  },
  {
    id: "vt_courts",
    name: "Court Case Search",
    agency: "VT Judiciary",
    description: "Civil, criminal, and family court records",
    searchUrl: "https://www.vermontjudiciary.org/court-calendars-and-records",
    icon: "Gavel",
  },
  {
    id: "vt_doc",
    name: "Offender Search",
    agency: "VT DOC",
    description: "Current inmates and supervised offenders in Vermont",
    searchUrl: "https://doc.vermont.gov/content/offender-lookup",
    icon: "ShieldAlert",
  },
  {
    id: "vt_sex_offenders",
    name: "Sex Offender Registry",
    agency: "VT State Police",
    description: "Registered sex offenders in Vermont",
    searchUrl: "https://sor.vermont.gov/",
    icon: "AlertTriangle",
  },
  {
    id: "vt_voter",
    name: "Voter Registration",
    agency: "VT Secretary of State",
    description: "Voter registration status lookup",
    searchUrl: "https://mvp.vermont.gov/",
    icon: "Vote",
  },
  {
    id: "vt_ucc",
    name: "UCC Filings",
    agency: "VT Secretary of State",
    description: "Uniform Commercial Code financing statements",
    searchUrl: "https://bizfilings.vermont.gov/online/UCCInquire/Search",
    icon: "FileText",
  },
];

export const VT_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "vt_sos_opr",
    name: "Professional License Lookup",
    agency: "VT Office of Professional Regulation",
    description: "Doctors, nurses, real estate agents, and more",
    searchUrl: "https://sos.vermont.gov/opr/verify-a-license/",
    icon: "Briefcase",
  },
  {
    id: "vt_bar",
    name: "Attorney Search",
    agency: "VT Bar Association",
    description: "Licensed attorneys in Vermont",
    searchUrl: "https://www.vtbar.org/find-a-lawyer/",
    icon: "Scale",
  },
];

export const VT_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    id: "vt_sos_cf",
    name: "VT Campaign Finance",
    agency: "VT Secretary of State",
    description: "Campaign contributions and expenditure reports",
    searchUrl: "https://campaignfinance.vermont.gov/",
    icon: "Vote",
  },
  {
    id: "vt_lobbyist",
    name: "VT Lobbyist Search",
    agency: "VT Secretary of State",
    description: "Registered lobbyists in Vermont",
    searchUrl: "https://lobbying.vermont.gov/",
    icon: "Building2",
  },
];

export const VT_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Chittenden", label: "Chittenden County", url: "https://www.cctv.ci.burlington.vt.us/" },
  { county: "Rutland", label: "Rutland County", url: "https://www.rutlandcounty.org/" },
  { county: "Washington", label: "Washington County", url: "https://www.montpelier-vt.org/173/Assessor" },
  { county: "Windham", label: "Windham County", url: "https://www.windhamcountyvt.gov/" },
];
