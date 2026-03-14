import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const AK_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "ak_corps", name: "Business Entity Search", agency: "AK Division of Corporations", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://www.commerce.alaska.gov/cbp/Main/Search/Entities?SearchType=EntityName&SearchString=${name}" },
  { id: "ak_courts", name: "Court Case Search (CourtView)", agency: "AK Court System", description: "Civil, criminal, and family court records", searchUrl: "https://records.courts.alaska.gov/eaccess/search.page.1", icon: "Gavel" },
  { id: "ak_doc", name: "Offender Search (PRIOR)", agency: "AK DOC", description: "Current and released offenders", searchUrl: "https://www.prior.prior.state.ak.us/prior/", icon: "ShieldAlert" },
  { id: "ak_sex_offenders", name: "Sex Offender Registry", agency: "AK DPS", description: "Registered sex offenders in Alaska", searchUrl: "https://dps.alaska.gov/sorweb/", icon: "AlertTriangle" },
  { id: "ak_voter", name: "Voter Registration", agency: "AK Division of Elections", description: "Voter registration status", searchUrl: "https://myvoterinformation.alaska.gov/", icon: "Vote" },
  { id: "ak_ucc", name: "UCC Filings", agency: "AK DNR Recorder's Office", description: "Uniform Commercial Code financing statements", searchUrl: "https://dnr.alaska.gov/ssd/recoff/searchRecdocs", icon: "FileText" },
];

export const AK_LICENSE_SOURCES: RecordSource[] = [
  { id: "ak_license", name: "Professional License Lookup", agency: "AK DCCED", description: "Doctors, nurses, contractors, and more", searchUrl: "https://www.commerce.alaska.gov/cbp/Main/Search/Professional", icon: "Briefcase" },
  { id: "ak_bar", name: "Attorney Search", agency: "AK Bar Association", description: "Licensed attorneys in Alaska", searchUrl: "https://www.alaskabar.org/attorney-directory/", icon: "Scale" },
];

export const AK_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "ak_apoc", name: "AK Campaign Finance", agency: "AK APOC", description: "Campaign contributions and disclosures", searchUrl: "https://aws.state.ak.us/ApocReports/prior/prior", icon: "Vote" },
];

export const AK_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Anchorage", label: "Municipality of Anchorage", url: "https://www.muni.org/Departments/Finance/Pages/PropertyTax.aspx" },
  { county: "Fairbanks North Star", label: "Fairbanks NSB", url: "https://www.fnsb.gov/244/Assessing" },
  { county: "Matanuska-Susitna", label: "Mat-Su Borough", url: "https://www.matsugov.us/assessor" },
  { county: "Kenai Peninsula", label: "Kenai Peninsula Borough", url: "https://www.kpb.us/assessor-dept" },
];
