import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const WI_STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "wi_dfi_corps",
    name: "Business Entity Search",
    agency: "WI DFI",
    description: "Corporations, LLCs, LPs, and trade names",
    searchUrl: "",
    icon: "Building2",
    deepLinkable: true,
    urlTemplate: "https://www.wdfi.org/apps/CorpSearch/Results.aspx?type=Simple&q=${name}",
  },
  {
    id: "wi_ccap",
    name: "Court Case Search (CCAP)",
    agency: "WI Courts",
    description: "Circuit court case records across all counties",
    searchUrl: "",
    icon: "Gavel",
    deepLinkable: true,
    urlTemplate: "https://wcca.wicourts.gov/caseSearchResults.html?inputVO.lastName=${name}&countyNo=0",
  },
  {
    id: "wi_doc",
    name: "Offender Locator",
    agency: "WI DOC",
    description: "Current inmates and supervised offenders",
    searchUrl: "https://appsdoc.wi.gov/lop/",
    icon: "ShieldAlert",
  },
  {
    id: "wi_sex_offenders",
    name: "Sex Offender Registry",
    agency: "WI DOC",
    description: "Registered sex offenders in Wisconsin",
    searchUrl: "https://appsdoc.wi.gov/sexoffender/",
    icon: "AlertTriangle",
  },
  {
    id: "wi_voter",
    name: "Voter Registration",
    agency: "WI Elections Commission",
    description: "Voter registration status verification",
    searchUrl: "https://myvote.wi.gov/en-us/My-Voter-Info",
    icon: "Vote",
  },
  {
    id: "wi_ucc",
    name: "UCC Filings",
    agency: "WI DFI",
    description: "Uniform Commercial Code financing statements",
    searchUrl: "https://www.wdfi.org/ucc/search/",
    icon: "FileText",
  },
];

export const WI_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "wi_dsps",
    name: "Professional License Lookup",
    agency: "WI DSPS",
    description: "Doctors, nurses, real estate, contractors, and more",
    searchUrl: "https://licensesearch.wi.gov/",
    icon: "Briefcase",
  },
  {
    id: "wi_state_bar",
    name: "Attorney Search",
    agency: "State Bar of Wisconsin",
    description: "Licensed attorneys in Wisconsin",
    searchUrl: "https://www.wisbar.org/forPublic/FindALawyer/Pages/Find-a-Lawyer.aspx",
    icon: "Scale",
  },
];

export const WI_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    id: "wi_ethics_cf",
    name: "WI Campaign Finance",
    agency: "WI Ethics Commission",
    description: "Campaign contributions and expenditure reports",
    searchUrl: "https://cfis.wi.gov/Public/Registration.aspx",
    icon: "Vote",
  },
  {
    id: "wi_lobbyist",
    name: "WI Lobbyist Search",
    agency: "WI Ethics Commission",
    description: "Registered lobbyists and their principals",
    searchUrl: "https://lobbying.wi.gov/Home/Welcome",
    icon: "Building2",
  },
];

export const WI_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Milwaukee", label: "Milwaukee County", url: "https://www.mclio.org/" },
  { county: "Dane", label: "Dane County", url: "https://accessdane.countyofdane.com/" },
  { county: "Waukesha", label: "Waukesha County", url: "https://www.waukeshacounty.gov/landandparks/real-property-listing/" },
  { county: "Brown", label: "Brown County", url: "https://www.browncountywi.gov/departments/land-information-office/" },
  { county: "Racine", label: "Racine County", url: "https://www.racinecounty.com/government/real-property-lister" },
  { county: "Outagamie", label: "Outagamie County", url: "https://tax.outagamie.org/" },
];
