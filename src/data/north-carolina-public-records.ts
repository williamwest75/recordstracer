import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const NC_STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "nc_sos_corps",
    name: "Business Entity Search",
    agency: "NC Secretary of State",
    description: "Corporations, LLCs, LPs, and assumed names",
    searchUrl: "",
    icon: "Building2",
    deepLinkable: true,
    urlTemplate: "https://www.sosnc.gov/online_services/search/by_title/_Business_Registration?search=${name}",
  },
  {
    id: "nc_courts",
    name: "Court Case Search",
    agency: "NC Courts",
    description: "Civil, criminal, and traffic court records",
    searchUrl: "https://www.nccourts.gov/court-dates-calendars-and-information",
    icon: "Gavel",
  },
  {
    id: "nc_doc",
    name: "Offender Search",
    agency: "NC Dept. of Public Safety",
    description: "Current and released offenders in NC prisons",
    searchUrl: "https://webapps.doc.state.nc.us/opi/offendersearch.do",
    icon: "ShieldAlert",
  },
  {
    id: "nc_sex_offenders",
    name: "Sex Offender Registry",
    agency: "NC SBI",
    description: "Registered sex offenders in North Carolina",
    searchUrl: "https://sexoffender.ncsbi.gov/",
    icon: "AlertTriangle",
  },
  {
    id: "nc_voter",
    name: "Voter Registration",
    agency: "NC State Board of Elections",
    description: "Voter registration lookup and history",
    searchUrl: "https://vt.ncsbe.gov/RegLkup/",
    icon: "Vote",
  },
  {
    id: "nc_ucc",
    name: "UCC Filings",
    agency: "NC Secretary of State",
    description: "Uniform Commercial Code financing statements",
    searchUrl: "https://www.sosnc.gov/online_services/search/by_title/_UCC",
    icon: "FileText",
  },
];

export const NC_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "nc_medical_board",
    name: "Medical License Verification",
    agency: "NC Medical Board",
    description: "Physicians and physician assistants licensed in NC",
    searchUrl: "https://portal.ncmedboard.org/verification/search.aspx",
    icon: "Stethoscope",
  },
  {
    id: "nc_state_bar",
    name: "Attorney Search",
    agency: "NC State Bar",
    description: "Licensed attorneys in North Carolina",
    searchUrl: "https://www.ncbar.gov/for-the-public/find-a-lawyer/",
    icon: "Scale",
  },
];

export const NC_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    id: "nc_sboe_cf",
    name: "NC Campaign Finance",
    agency: "NC State Board of Elections",
    description: "Campaign contributions and expenditure reports",
    searchUrl: "https://cf.ncsbe.gov/CFTxnLkup/",
    icon: "Vote",
  },
  {
    id: "nc_lobbyist",
    name: "NC Lobbyist Search",
    agency: "NC Secretary of State",
    description: "Registered lobbyists and their principals",
    searchUrl: "https://www.sosnc.gov/online_services/search/by_title/_Lobbyist",
    icon: "Building2",
  },
];

export const NC_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Mecklenburg", label: "Mecklenburg County", url: "https://polaris3g.mecklenburgcountync.gov/" },
  { county: "Wake", label: "Wake County", url: "https://services.wakegov.com/realestate/" },
  { county: "Guilford", label: "Guilford County", url: "https://www.guilfordcountync.gov/government/departments/tax/real-property-search" },
  { county: "Forsyth", label: "Forsyth County", url: "https://www.cityofws.org/421/Tax-Assessor" },
  { county: "Cumberland", label: "Cumberland County", url: "https://www.co.cumberland.nc.us/departments/tax/real-property" },
  { county: "Durham", label: "Durham County", url: "https://www.dconc.gov/government/departments-a-h/tax-administration/real-property-records" },
  { county: "Buncombe", label: "Buncombe County", url: "https://www.buncombecounty.org/governing/depts/tax/default.aspx" },
  { county: "New Hanover", label: "New Hanover County", url: "https://etax.nhcgov.com/PT/search/commonsearch.aspx?mode=OWNER" },
];
