import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const ME_STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "me_sos_corps",
    name: "Business Entity Search",
    agency: "ME Secretary of State",
    description: "Corporations, LLCs, LPs, and trade names",
    searchUrl: "",
    icon: "Building2",
    deepLinkable: true,
    urlTemplate: "https://icrs.informe.org/nei-sos-icrs/ICRS?MainPage=x&Command=SEARCH&SearchType=entity&SearchString=${name}",
  },
  {
    id: "me_courts",
    name: "Court Case Search",
    agency: "ME Judicial Branch",
    description: "Civil, criminal, and family court records",
    searchUrl: "https://www.courts.maine.gov/",
    icon: "Gavel",
  },
  {
    id: "me_doc",
    name: "Inmate Search",
    agency: "ME DOC",
    description: "Current inmates in Maine state facilities",
    searchUrl: "https://www.maine.gov/corrections/offender-info/search",
    icon: "ShieldAlert",
  },
  {
    id: "me_sex_offenders",
    name: "Sex Offender Registry",
    agency: "ME SBI",
    description: "Registered sex offenders in Maine",
    searchUrl: "https://sor.informe.org/sor/",
    icon: "AlertTriangle",
  },
  {
    id: "me_voter",
    name: "Voter Registration",
    agency: "ME Secretary of State",
    description: "Voter registration status lookup",
    searchUrl: "https://www.maine.gov/sos/cec/elec/voter-info/index.html",
    icon: "Vote",
  },
  {
    id: "me_ucc",
    name: "UCC Filings",
    agency: "ME Secretary of State",
    description: "Uniform Commercial Code financing statements",
    searchUrl: "https://www.maine.gov/sos/corp/uccsearch.html",
    icon: "FileText",
  },
];

export const ME_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "me_pfr",
    name: "Professional License Lookup",
    agency: "ME Office of Professional & Financial Regulation",
    description: "Doctors, nurses, real estate agents, and more",
    searchUrl: "https://www.pfr.maine.gov/ALMSOnline/ALMSQuery/SearchIndividual.aspx",
    icon: "Briefcase",
  },
  {
    id: "me_bar",
    name: "Attorney Search",
    agency: "ME Board of Overseers of the Bar",
    description: "Licensed attorneys in Maine",
    searchUrl: "https://www.mebaroverseers.org/attorney_services/",
    icon: "Scale",
  },
];

export const ME_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    id: "me_ethics_cf",
    name: "ME Campaign Finance",
    agency: "ME Ethics Commission",
    description: "Campaign contributions and expenditure reports",
    searchUrl: "https://mainecampaignfinance.com/",
    icon: "Vote",
  },
  {
    id: "me_lobbyist",
    name: "ME Lobbyist Search",
    agency: "ME Ethics Commission",
    description: "Registered lobbyists and their clients",
    searchUrl: "https://mainecampaignfinance.com/#/lobbyist",
    icon: "Building2",
  },
];

export const ME_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Cumberland", label: "Cumberland County", url: "https://gis.cumberlandcounty.org/assessor/" },
  { county: "York", label: "York County", url: "https://www.yorkcountymaine.gov/register-of-deeds" },
  { county: "Penobscot", label: "Penobscot County", url: "https://www.penobscotcounty.net/registry-of-deeds" },
  { county: "Kennebec", label: "Kennebec County", url: "https://www.kennebeccounty.org/deeds" },
  { county: "Androscoggin", label: "Androscoggin County", url: "https://www.androscoggincounty.me/registry-of-deeds" },
];
