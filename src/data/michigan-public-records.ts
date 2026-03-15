import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const MI_STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "mi_lara_corps",
    name: "Business Entity Search",
    agency: "MI LARA",
    description: "Corporations, LLCs, LPs, and assumed names",
    searchUrl: "",
    icon: "Building2",
    deepLinkable: true,
    urlTemplate: "https://cofs.lara.state.mi.us/SearchApi/Search/Search?searchText=${name}",
  },
  {
    id: "mi_courts",
    name: "Court Case Search",
    agency: "MI Courts",
    description: "Trial court case information lookup",
    searchUrl: "https://micourt.courts.michigan.gov/case-search",
    icon: "Gavel",
  },
  {
    id: "mi_otis",
    name: "Offender Search (OTIS)",
    agency: "MI DOC",
    description: "Current inmates and parolees in Michigan",
    searchUrl: "https://mdocweb.state.mi.us/OTIS2/otis2.aspx",
    icon: "ShieldAlert",
  },
  {
    id: "mi_sex_offenders",
    name: "Sex Offender Registry",
    agency: "MI State Police",
    description: "Registered sex offenders in Michigan",
    searchUrl: "https://www.communitynotification.com/cap_office_disclaimer.php?office=55242",
    icon: "AlertTriangle",
  },
  {
    id: "mi_voter",
    name: "Voter Registration",
    agency: "MI Secretary of State",
    description: "Voter registration status lookup",
    searchUrl: "https://mvic.sos.state.mi.us/",
    icon: "Vote",
  },
  {
    id: "mi_ucc",
    name: "UCC Filings",
    agency: "MI Secretary of State",
    description: "Uniform Commercial Code financing statements",
    searchUrl: "https://cofs.lara.state.mi.us/SearchApi/Search/Search",
    icon: "FileText",
  },
];

export const MI_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "mi_lara_license",
    name: "Professional License Lookup",
    agency: "MI LARA",
    description: "Doctors, nurses, contractors, real estate, and more",
    searchUrl: "https://aca3.accela.com/MILARA/GeneralProperty/PropertyLookUp.aspx",
    icon: "Briefcase",
  },
  {
    id: "mi_state_bar",
    name: "Attorney Search",
    agency: "State Bar of Michigan",
    description: "Licensed attorneys in Michigan",
    searchUrl: "https://www.zeekbeek.com/SBM",
    icon: "Scale",
  },
];

export const MI_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    id: "mi_sos_cf",
    name: "MI Campaign Finance",
    agency: "MI Secretary of State",
    description: "Campaign contributions and expenditure reports",
    searchUrl: "https://www.michigan.gov/sos/elections/disclosure/cfr",
    icon: "Vote",
  },
  {
    id: "mi_lobbyist",
    name: "MI Lobbyist Search",
    agency: "MI Secretary of State",
    description: "Registered lobbyists and their employers",
    searchUrl: "https://miboecfr.nictusa.com/cgi-bin/cfr/lobby_srch.cgi",
    icon: "Building2",
  },
];

export const MI_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Wayne", label: "Wayne County", url: "https://www.waynecounty.com/elected/treasurer/property-search.aspx" },
  { county: "Oakland", label: "Oakland County", url: "https://www.oakgov.com/advantageoakland/property" },
  { county: "Macomb", label: "Macomb County", url: "https://macombgis.macombgov.org/macombpropertysearch/" },
  { county: "Kent", label: "Kent County", url: "https://www.accesskent.com/Property/" },
  { county: "Washtenaw", label: "Washtenaw County", url: "https://www.ewashtenaw.org/government/departments/equalization/online-property-search" },
  { county: "Genesee", label: "Genesee County", url: "https://www.geneseecounty.gov/departments/equalization/parcel-search" },
  { county: "Ingham", label: "Ingham County", url: "https://eq.ingham.org/" },
  { county: "Kalamazoo", label: "Kalamazoo County", url: "https://www.kalcounty.com/equalization/" },
];
