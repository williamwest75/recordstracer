import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const VA_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "va_scc_corps", name: "Business Entity Search", agency: "VA SCC", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://cis.scc.virginia.gov/EntitySearch/Index?searchTerm=${name}" },
  { id: "va_courts", name: "Court Case Search", agency: "VA Judicial System", description: "Circuit and general district court records", searchUrl: "https://eapps.courts.state.va.us/CJISWeb/circuit.jsp", icon: "Gavel" },
  { id: "va_doc", name: "Offender Search", agency: "VA DOC", description: "Current inmates in Virginia facilities", searchUrl: "https://vadoc.virginia.gov/offenders/offender-search/", icon: "ShieldAlert" },
  { id: "va_sex_offenders", name: "Sex Offender Registry", agency: "VA State Police", description: "Registered sex offenders in Virginia", searchUrl: "https://sex-offender.vsp.virginia.gov/sor/", icon: "AlertTriangle" },
  { id: "va_voter", name: "Voter Registration", agency: "VA Dept. of Elections", description: "Voter registration status", searchUrl: "https://vote.elections.virginia.gov/VoterInformation", icon: "Vote" },
  { id: "va_ucc", name: "UCC Filings", agency: "VA SCC", description: "Uniform Commercial Code financing statements", searchUrl: "https://cis.scc.virginia.gov/UCCSearch/Index", icon: "FileText" },
];

export const VA_LICENSE_SOURCES: RecordSource[] = [
  { id: "va_dpor", name: "Professional License Lookup", agency: "VA DPOR", description: "Contractors, real estate, engineers, and more", searchUrl: "https://www.dpor.virginia.gov/LicenseLookup/", icon: "Briefcase" },
  { id: "va_bar", name: "Attorney Search", agency: "VA State Bar", description: "Licensed attorneys in Virginia", searchUrl: "https://www.vsb.org/site/public/finding_a_lawyer", icon: "Scale" },
];

export const VA_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "va_sbe_cf", name: "VA Campaign Finance (VPAP)", agency: "VA Public Access Project", description: "Campaign contributions and expenditures", searchUrl: "https://www.vpap.org/donors/", icon: "Vote" },
];

export const VA_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Fairfax", label: "Fairfax County", url: "https://icare.fairfaxcounty.gov/ffxcare/search/commonsearch.aspx?mode=OWNER" },
  { county: "Virginia Beach", label: "Virginia Beach", url: "https://www.vbgov.com/government/departments/real-estate-assessor/Pages/default.aspx" },
  { county: "Prince William", label: "Prince William County", url: "https://www.pwcva.gov/department/real-estate-assessments/real-estate-search" },
  { county: "Loudoun", label: "Loudoun County", url: "https://ims.loudoun.gov/" },
  { county: "Chesterfield", label: "Chesterfield County", url: "https://www.chesterfield.gov/194/Real-Estate-Assessments" },
  { county: "Henrico", label: "Henrico County", url: "https://henrico.us/services/real-estate-assessment/" },
  { county: "Arlington", label: "Arlington County", url: "https://propertyinformation.arlingtonva.us/" },
  { county: "Richmond City", label: "City of Richmond", url: "https://www.ci.richmond.va.us/assessor/" },
];
