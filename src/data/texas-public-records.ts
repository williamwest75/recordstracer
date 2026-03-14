import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const TX_STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "tx_sos_corps",
    name: "Business Entity Search",
    agency: "TX Secretary of State",
    description: "Corporations, LLCs, LPs, and assumed names",
    searchUrl: "",
    icon: "Building2",
    deepLinkable: true,
    urlTemplate: "https://mycpa.cpa.state.tx.us/coa/coaSearchBtn?searchType=entity&searchString=${name}",
  },
  {
    id: "tx_courts_online",
    name: "Court Case Search",
    agency: "TX Office of Court Administration",
    description: "Statewide court case records",
    searchUrl: "https://card.txcourts.gov/",
    icon: "Gavel",
  },
  {
    id: "tx_tdcj",
    name: "Inmate Search",
    agency: "TX TDCJ",
    description: "Current and past inmates in Texas state prisons",
    searchUrl: "https://inmate.tdcj.texas.gov/InmateSearch/start.action",
    icon: "ShieldAlert",
  },
  {
    id: "tx_sex_offenders",
    name: "Sex Offender Registry",
    agency: "TX DPS",
    description: "Registered sex offenders in Texas",
    searchUrl: "https://records.txdps.state.tx.us/SexOffenderRegistry",
    icon: "AlertTriangle",
  },
  {
    id: "tx_voter",
    name: "Voter Registration",
    agency: "TX Secretary of State",
    description: "Voter registration status verification",
    searchUrl: "https://teamrv-mvp.sos.texas.gov/MVP/mvp.do",
    icon: "Vote",
  },
  {
    id: "tx_ucc",
    name: "UCC Filings",
    agency: "TX Secretary of State",
    description: "Uniform Commercial Code financing statements",
    searchUrl: "https://direct.sos.state.tx.us/ucc/Search.asp",
    icon: "FileText",
  },
];

export const TX_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "tx_tdlr",
    name: "Professional License Lookup",
    agency: "TX TDLR",
    description: "Barbers, electricians, A/C techs, auctioneers, and more",
    searchUrl: "https://www.tdlr.texas.gov/LicenseSearch/",
    icon: "Briefcase",
  },
  {
    id: "tx_tmb",
    name: "Medical License Verification",
    agency: "TX Medical Board",
    description: "Physicians, physician assistants, acupuncturists",
    searchUrl: "https://profile.tmb.state.tx.us/Search.aspx",
    icon: "Stethoscope",
  },
  {
    id: "tx_state_bar",
    name: "Attorney Search",
    agency: "State Bar of Texas",
    description: "Licensed attorneys in Texas",
    searchUrl: "",
    icon: "Scale",
    deepLinkable: true,
    urlTemplate: "https://www.texasbar.com/AM/Template.cfm?Section=Find_A_Lawyer&template=/CustomSource/MemberDirectory/MemberDirectoryDetail.cfm&ContactID=0&SearchType=LastName&LastName=${name}",
  },
];

export const TX_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    id: "tx_tec",
    name: "TX Campaign Finance",
    agency: "TX Ethics Commission",
    description: "State campaign contributions and expenditure reports",
    searchUrl: "https://www.ethics.state.tx.us/search/cf/",
    icon: "Vote",
  },
  {
    id: "tx_lobbyist",
    name: "TX Lobbyist Search",
    agency: "TX Ethics Commission",
    description: "Registered lobbyists and their clients",
    searchUrl: "https://www.ethics.state.tx.us/search/lobby/",
    icon: "Building2",
  },
];

export const TX_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Harris", label: "Harris County Appraisal District", url: "https://public.hcad.org/" },
  { county: "Dallas", label: "Dallas CAD", url: "https://www.dallascad.org/" },
  { county: "Tarrant", label: "Tarrant Appraisal District", url: "https://www.tad.org/" },
  { county: "Bexar", label: "Bexar Appraisal District", url: "https://www.bcad.org/" },
  { county: "Travis", label: "Travis CAD", url: "https://www.traviscad.org/" },
  { county: "Collin", label: "Collin CAD", url: "https://www.collincad.org/" },
  { county: "Fort Bend", label: "Fort Bend CAD", url: "https://www.fbcad.org/" },
  { county: "Williamson", label: "Williamson CAD", url: "https://www.wcad.org/" },
];
