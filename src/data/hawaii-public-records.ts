import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const HI_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "hi_breg", name: "Business Entity Search", agency: "HI DCCA", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://hbe.ehawaii.gov/documents/search.html?query=${name}" },
  { id: "hi_courts", name: "Court Case Search (eCourt Kokua)", agency: "HI Judiciary", description: "Civil, criminal, and family court records", searchUrl: "https://www.courts.state.hi.us/legal_references/records/jims", icon: "Gavel" },
  { id: "hi_doc", name: "Inmate Search (SAVIN)", agency: "HI DPS", description: "Current inmates in Hawaii facilities", searchUrl: "https://vinelink.vineapps.com/search/HI/Person", icon: "ShieldAlert" },
  { id: "hi_sex_offenders", name: "Sex Offender Registry", agency: "HI Attorney General", description: "Registered sex offenders in Hawaii", searchUrl: "http://sexoffenders.ehawaii.gov/sexoffender/welcome.html", icon: "AlertTriangle" },
  { id: "hi_voter", name: "Voter Registration", agency: "HI Office of Elections", description: "Voter registration status", searchUrl: "https://olvr.hawaii.gov/", icon: "Vote" },
];

export const HI_LICENSE_SOURCES: RecordSource[] = [
  { id: "hi_pvl", name: "Professional License Lookup", agency: "HI DCCA PVL", description: "Various professional and vocational licenses", searchUrl: "https://mypvl.dcca.hawaii.gov/", icon: "Briefcase" },
  { id: "hi_bar", name: "Attorney Search", agency: "HI Supreme Court", description: "Licensed attorneys in Hawaii", searchUrl: "https://www.courts.state.hi.us/self-help/attorney-directory", icon: "Scale" },
];

export const HI_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "hi_cc_cf", name: "HI Campaign Finance", agency: "HI Campaign Spending Commission", description: "Campaign contributions and expenditures", searchUrl: "https://ags.hawaii.gov/campaign/", icon: "Vote" },
];

export const HI_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Honolulu", label: "City & County of Honolulu", url: "https://www.qpublic.net/hi/honolulu/" },
  { county: "Maui", label: "Maui County", url: "https://www.qpublic.net/hi/maui/" },
  { county: "Hawaii", label: "Hawaii County", url: "https://www.qpublic.net/hi/hawaii/" },
  { county: "Kauai", label: "Kauai County", url: "https://www.qpublic.net/hi/kauai/" },
];
