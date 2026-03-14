import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const OH_STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "oh_sos_corps",
    name: "Business Entity Search",
    agency: "OH Secretary of State",
    description: "Corporations, LLCs, LPs, trade names, and nonprofits",
    searchUrl: "",
    icon: "Building2",
    deepLinkable: true,
    urlTemplate: "https://businesssearch.ohiosos.gov/?=&SearchType=ByName&SearchTerm=${name}",
  },
  {
    id: "oh_courts",
    name: "Court Case Search",
    agency: "OH Supreme Court",
    description: "Statewide case information via Ohio Courts Network",
    searchUrl: "https://www.supremecourt.ohio.gov/JudSystem/OhioCourts/",
    icon: "Gavel",
  },
  {
    id: "oh_drc",
    name: "Offender Search",
    agency: "OH DRC",
    description: "Current and released inmates in Ohio state prisons",
    searchUrl: "https://appgateway.drc.ohio.gov/OffenderSearch",
    icon: "ShieldAlert",
  },
  {
    id: "oh_sex_offenders",
    name: "Sex Offender Registry (eSORN)",
    agency: "OH Attorney General",
    description: "Registered sex offenders in Ohio",
    searchUrl: "https://sheriffalerts.com/cap_office_disclaimer.php?office=55150&fession=5",
    icon: "AlertTriangle",
  },
  {
    id: "oh_voter",
    name: "Voter Registration",
    agency: "OH Secretary of State",
    description: "Voter registration status lookup",
    searchUrl: "https://voterlookup.ohiosos.gov/voterlookup.aspx",
    icon: "Vote",
  },
  {
    id: "oh_ucc",
    name: "UCC Filings",
    agency: "OH Secretary of State",
    description: "Uniform Commercial Code financing statements",
    searchUrl: "https://www5.sos.state.oh.us/ords/f?p=UCC:SEARCH",
    icon: "FileText",
  },
];

export const OH_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "oh_elicense",
    name: "Professional License Lookup",
    agency: "OH eLicense",
    description: "Doctors, nurses, contractors, real estate, and more",
    searchUrl: "https://elicense.ohio.gov/oh_verifylicense",
    icon: "Briefcase",
  },
  {
    id: "oh_supreme_court_attorney",
    name: "Attorney Search",
    agency: "OH Supreme Court",
    description: "Licensed attorneys in Ohio",
    searchUrl: "https://www.supremecourt.ohio.gov/AttySvcs/AttyReg/Public_Attorney_Search.aspx",
    icon: "Scale",
  },
];

export const OH_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    id: "oh_sos_cf",
    name: "OH Campaign Finance",
    agency: "OH Secretary of State",
    description: "Campaign contributions and expenditures",
    searchUrl: "https://www6.ohiosos.gov/ords/f?p=CFDISCLOSURE:SEARCH",
    icon: "Vote",
  },
  {
    id: "oh_lobbyist",
    name: "OH Lobbyist Search",
    agency: "Joint Legislative Ethics Committee",
    description: "Registered lobbyists and their employers",
    searchUrl: "https://www.jlec-olig.state.oh.us/olac/Reports/AgentSearch.aspx",
    icon: "Building2",
  },
];

export const OH_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Franklin", label: "Franklin County Auditor", url: "https://property.franklincountyauditor.com/" },
  { county: "Cuyahoga", label: "Cuyahoga County", url: "https://myplace.cuyahogacounty.us/en-US/property-search.aspx" },
  { county: "Hamilton", label: "Hamilton County Auditor", url: "https://wedge1.hcauditor.org/" },
  { county: "Summit", label: "Summit County Fiscal Office", url: "https://fiscaloffice.summitoh.net/real-property-search/" },
  { county: "Montgomery", label: "Montgomery County Auditor", url: "https://www.mcrealestate.org/" },
  { county: "Lucas", label: "Lucas County Auditor", url: "https://www.co.lucas.oh.us/auditor/" },
  { county: "Stark", label: "Stark County Auditor", url: "https://www.starkcountyohio.gov/auditor" },
  { county: "Butler", label: "Butler County Auditor", url: "https://www.butlercountyauditor.org/" },
];
