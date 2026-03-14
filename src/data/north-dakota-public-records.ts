import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const ND_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "nd_sos_corps", name: "Business Entity Search", agency: "ND Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://firststop.sos.nd.gov/search/business?searchText=${name}" },
  { id: "nd_courts", name: "Court Case Search", agency: "ND Courts", description: "District court case records", searchUrl: "https://www.ndcourts.gov/court-records", icon: "Gavel" },
  { id: "nd_doc", name: "Offender Search", agency: "ND DOCR", description: "Current inmates and supervised offenders", searchUrl: "https://docr.nd.gov/offender-search", icon: "ShieldAlert" },
  { id: "nd_sex_offenders", name: "Sex Offender Registry", agency: "ND Attorney General", description: "Registered sex offenders in North Dakota", searchUrl: "https://sexoffender.nd.gov/", icon: "AlertTriangle" },
  { id: "nd_voter", name: "Voter Registration", agency: "ND Secretary of State", description: "Voter information", searchUrl: "https://vip.sos.nd.gov/WhereToVoteID.aspx", icon: "Vote" },
  { id: "nd_ucc", name: "UCC Filings", agency: "ND Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://firststop.sos.nd.gov/search/ucc", icon: "FileText" },
];

export const ND_LICENSE_SOURCES: RecordSource[] = [
  { id: "nd_medical", name: "Medical License Verification", agency: "ND Board of Medicine", description: "Physicians licensed in North Dakota", searchUrl: "https://www.ndbom.org/verify/", icon: "Stethoscope" },
  { id: "nd_bar", name: "Attorney Search", agency: "State Bar Association of ND", description: "Licensed attorneys in North Dakota", searchUrl: "https://www.sband.org/page/LawyerSearch", icon: "Scale" },
];

export const ND_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "nd_sos_cf", name: "ND Campaign Finance", agency: "ND Secretary of State", description: "Campaign finance disclosures", searchUrl: "https://campaignfinance.nd.gov/", icon: "Vote" },
];

export const ND_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Cass", label: "Cass County", url: "https://www.casscountynd.gov/our-county/property-information" },
  { county: "Burleigh", label: "Burleigh County", url: "https://www.burleighco.com/departments/equalization/" },
  { county: "Grand Forks", label: "Grand Forks County", url: "https://www.gfcounty.nd.gov/departments/tax-equalization" },
  { county: "Ward", label: "Ward County", url: "https://www.co.ward.nd.us/153/Tax-Equalization" },
];
