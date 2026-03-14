import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const NY_STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "ny_dos_corps",
    name: "Business Entity Search",
    agency: "NY Dept. of State",
    description: "Corporations, LLCs, partnerships, trade names",
    searchUrl: "",
    icon: "Building2",
    deepLinkable: true,
    urlTemplate: "https://apps.dos.ny.gov/publicInquiry/EntitySearch?searchType=CONTAINS&searchTerm=${name}",
  },
  {
    id: "ny_ecourts",
    name: "Court Records (eCourts)",
    agency: "NY Unified Court System",
    description: "Civil, criminal, family, and surrogate court cases",
    searchUrl: "https://iapps.courts.state.ny.us/webcivil/FCASSearch",
    icon: "Gavel",
  },
  {
    id: "ny_doccs",
    name: "Inmate Lookup",
    agency: "NY DOCCS",
    description: "Current and released inmates in state facilities",
    searchUrl: "http://nysdoccslookup.doccs.ny.gov/",
    icon: "ShieldAlert",
  },
  {
    id: "ny_sex_offenders",
    name: "Sex Offender Registry",
    agency: "NY DCJS",
    description: "Registered sex offenders",
    searchUrl: "https://www.criminaljustice.ny.gov/SomsSUBDirectory/search_index.jsp",
    icon: "AlertTriangle",
  },
  {
    id: "ny_voter",
    name: "Voter Registration",
    agency: "NY Board of Elections",
    description: "Voter registration status lookup",
    searchUrl: "https://voterlookup.elections.ny.gov/",
    icon: "Vote",
  },
  {
    id: "ny_ucc",
    name: "UCC Lien Search",
    agency: "NY Dept. of State",
    description: "Uniform Commercial Code filings",
    searchUrl: "https://appext20.dos.ny.gov/pls/ucc_public/web_search.main_frame",
    icon: "FileText",
  },
];

export const NY_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "ny_op_professions",
    name: "Licensed Professions",
    agency: "NY State Education Dept.",
    description: "Doctors, nurses, engineers, architects, CPAs, pharmacists",
    searchUrl: "http://www.op.nysed.gov/opsearches.htm",
    icon: "Stethoscope",
  },
  {
    id: "ny_attorney",
    name: "Attorney Search",
    agency: "NY Courts",
    description: "Licensed attorneys admitted to practice in New York",
    searchUrl: "https://iapps.courts.state.ny.us/attorneyservices/search",
    icon: "Scale",
  },
];

export const NY_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    id: "ny_boe_cf",
    name: "NY Campaign Finance",
    agency: "NY Board of Elections",
    description: "State campaign contributions and filings",
    searchUrl: "https://publicreporting.elections.ny.gov/CandidateContributions/CandidateContributions",
    icon: "Vote",
  },
  {
    id: "ny_lobbyist",
    name: "NY Lobbyist Search",
    agency: "NY JCOPE / COELIG",
    description: "Registered lobbyists, clients, and activity reports",
    searchUrl: "https://onlineapps.jcope.ny.gov/LobbyWatch/Menu",
    icon: "Building2",
  },
];

export const NY_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "New York (Manhattan)", label: "NYC ACRIS", url: "https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName" },
  { county: "Kings (Brooklyn)", label: "NYC ACRIS", url: "https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName" },
  { county: "Queens", label: "NYC ACRIS", url: "https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName" },
  { county: "Bronx", label: "NYC ACRIS", url: "https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName" },
  { county: "Richmond (Staten Island)", label: "NYC ACRIS", url: "https://a836-acris.nyc.gov/DS/DocumentSearch/PartyName" },
  { county: "Nassau", label: "Nassau County Clerk", url: "https://i2f.uslandrecords.com/NY/Nassau/" },
  { county: "Suffolk", label: "Suffolk County Clerk", url: "https://clerk.suffolkcountyny.gov/" },
  { county: "Westchester", label: "Westchester County Clerk", url: "https://land-records.westchestergov.com/" },
];
