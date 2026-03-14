import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const MA_STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "ma_sos_corps",
    name: "Business Entity Search",
    agency: "MA Secretary of the Commonwealth",
    description: "Corporations, LLCs, LPs, and trade names",
    searchUrl: "",
    icon: "Building2",
    deepLinkable: true,
    urlTemplate: "https://corp.sec.state.ma.us/CorpWeb/CorpSearch/CorpSearch.aspx?searchterm=${name}",
  },
  {
    id: "ma_courts",
    name: "Court Case Search",
    agency: "MA Trial Court",
    description: "Civil, criminal, housing, and probate court records",
    searchUrl: "https://www.masscourts.org/eservices/home.page.2",
    icon: "Gavel",
  },
  {
    id: "ma_doc",
    name: "Inmate Search",
    agency: "MA DOC",
    description: "Current inmates in Massachusetts state prisons",
    searchUrl: "https://www.mass.gov/find-an-inmate",
    icon: "ShieldAlert",
  },
  {
    id: "ma_sex_offenders",
    name: "Sex Offender Registry",
    agency: "MA SORB",
    description: "Registered sex offenders in Massachusetts",
    searchUrl: "https://www.mass.gov/check-a-sex-offender",
    icon: "AlertTriangle",
  },
  {
    id: "ma_voter",
    name: "Voter Registration",
    agency: "MA Secretary of the Commonwealth",
    description: "Voter registration status lookup",
    searchUrl: "https://www.sec.state.ma.us/VoterRegistrationSearch/MyVoterRegStatus.aspx",
    icon: "Vote",
  },
  {
    id: "ma_ucc",
    name: "UCC Filings",
    agency: "MA Secretary of the Commonwealth",
    description: "Uniform Commercial Code financing statements",
    searchUrl: "https://corp.sec.state.ma.us/UCCSearch/UCCSearch.aspx",
    icon: "FileText",
  },
];

export const MA_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "ma_dpl",
    name: "Professional License Lookup",
    agency: "MA Division of Professional Licensure",
    description: "Electricians, plumbers, engineers, and more",
    searchUrl: "https://aca-prod.accela.com/MASS/",
    icon: "Briefcase",
  },
  {
    id: "ma_bbo",
    name: "Attorney Search",
    agency: "MA Board of Bar Overseers",
    description: "Licensed attorneys in Massachusetts",
    searchUrl: "https://www.massbbo.org/AttorneySearch",
    icon: "Scale",
  },
  {
    id: "ma_medical_board",
    name: "Medical License Verification",
    agency: "MA Board of Registration in Medicine",
    description: "Physicians licensed in Massachusetts",
    searchUrl: "https://profiles.ehs.state.ma.us/Profiles/Pages/FindAPhysician.aspx",
    icon: "Stethoscope",
  },
];

export const MA_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    id: "ma_ocpf",
    name: "MA Campaign Finance",
    agency: "MA OCPF",
    description: "Campaign contributions and expenditure reports",
    searchUrl: "https://www.ocpf.us/Filers",
    icon: "Vote",
  },
  {
    id: "ma_lobbyist",
    name: "MA Lobbyist Search",
    agency: "MA Secretary of the Commonwealth",
    description: "Registered lobbyists and their clients",
    searchUrl: "https://www.sec.state.ma.us/LobbyistPublicSearch/",
    icon: "Building2",
  },
];

export const MA_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Suffolk (Boston)", label: "City of Boston", url: "https://www.boston.gov/departments/assessing/property-assessment" },
  { county: "Middlesex", label: "Middlesex Registry", url: "https://www.middlesexsouthregistry.com/" },
  { county: "Worcester", label: "Worcester Registry", url: "https://www.worcesterdeeds.com/" },
  { county: "Essex", label: "Essex Registry", url: "https://www.salemdeeds.com/" },
  { county: "Norfolk", label: "Norfolk Registry", url: "https://www.norfolkdeeds.org/" },
  { county: "Plymouth", label: "Plymouth Registry", url: "https://www.plymouthdeeds.org/" },
];
