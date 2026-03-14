import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const NH_STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "nh_sos_corps",
    name: "Business Entity Search",
    agency: "NH Secretary of State",
    description: "Corporations, LLCs, LPs, and trade names",
    searchUrl: "",
    icon: "Building2",
    deepLinkable: true,
    urlTemplate: "https://quickstart.sos.nh.gov/online/BusinessInquire/Search?searchTerm=${name}",
  },
  {
    id: "nh_courts",
    name: "Court Case Search",
    agency: "NH Judicial Branch",
    description: "Civil, criminal, and family court records",
    searchUrl: "https://www.courts.nh.gov/resources/case-information",
    icon: "Gavel",
  },
  {
    id: "nh_doc",
    name: "Inmate Search",
    agency: "NH DOC",
    description: "Current inmates in New Hampshire facilities",
    searchUrl: "https://www.nh.gov/nhdoc/divisions/field/inmate_locator.html",
    icon: "ShieldAlert",
  },
  {
    id: "nh_sex_offenders",
    name: "Sex Offender Registry",
    agency: "NH Dept. of Safety",
    description: "Registered sex offenders in New Hampshire",
    searchUrl: "https://business.nh.gov/SexOffendersFull/Search.aspx",
    icon: "AlertTriangle",
  },
  {
    id: "nh_voter",
    name: "Voter Registration",
    agency: "NH Secretary of State",
    description: "Voter information lookup",
    searchUrl: "https://app.sos.nh.gov/viphome",
    icon: "Vote",
  },
  {
    id: "nh_ucc",
    name: "UCC Filings",
    agency: "NH Secretary of State",
    description: "Uniform Commercial Code financing statements",
    searchUrl: "https://quickstart.sos.nh.gov/online/UCCInquire/Search",
    icon: "FileText",
  },
];

export const NH_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "nh_oplc",
    name: "Professional License Lookup",
    agency: "NH OPLC",
    description: "Real estate, electricians, plumbers, and more",
    searchUrl: "https://forms.nh.gov/licenseverification/",
    icon: "Briefcase",
  },
  {
    id: "nh_bar",
    name: "Attorney Search",
    agency: "NH Bar Association",
    description: "Licensed attorneys in New Hampshire",
    searchUrl: "https://www.nhbar.org/lawyer-referral-service",
    icon: "Scale",
  },
];

export const NH_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    id: "nh_sos_cf",
    name: "NH Campaign Finance",
    agency: "NH Secretary of State",
    description: "Campaign contributions and expenditure reports",
    searchUrl: "https://cfs.sos.nh.gov/",
    icon: "Vote",
  },
  {
    id: "nh_lobbyist",
    name: "NH Lobbyist Search",
    agency: "NH Secretary of State",
    description: "Registered lobbyists",
    searchUrl: "https://www.sos.nh.gov/lobbyists",
    icon: "Building2",
  },
];

export const NH_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Hillsborough", label: "Hillsborough County", url: "https://nhdeeds.com/" },
  { county: "Rockingham", label: "Rockingham County", url: "https://www.nhdeeds.org/" },
  { county: "Merrimack", label: "Merrimack County", url: "https://www.merrimackcountynh.gov/departments/registry-of-deeds/" },
  { county: "Strafford", label: "Strafford County", url: "https://co.strafford.nh.us/registry-of-deeds" },
  { county: "Cheshire", label: "Cheshire County", url: "https://www.co.cheshire.nh.us/register-of-deeds/" },
];
