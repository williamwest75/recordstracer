import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const WY_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "wy_sos_corps", name: "Business Entity Search", agency: "WY Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://wyobiz.wyo.gov/Business/FilingSearch.aspx?searchTerm=${name}" },
  { id: "wy_courts", name: "Court Case Search", agency: "WY Judiciary", description: "District court case records", searchUrl: "https://www.courts.state.wy.us/legal-self-help/court-records/", icon: "Gavel" },
  { id: "wy_doc", name: "Offender Search", agency: "WY DOC", description: "Current inmates in Wyoming facilities", searchUrl: "https://corrections.wyo.gov/inmate-search", icon: "ShieldAlert" },
  { id: "wy_sex_offenders", name: "Sex Offender Registry", agency: "WY DCI", description: "Registered sex offenders in Wyoming", searchUrl: "https://wyomingdci.wyo.gov/criminal-justice-information-services-cjis/sex-offender-registry", icon: "AlertTriangle" },
  { id: "wy_voter", name: "Voter Registration", agency: "WY Secretary of State", description: "Voter registration status", searchUrl: "https://sos.wyo.gov/Elections/Voter/VoterRegistration.aspx", icon: "Vote" },
  { id: "wy_ucc", name: "UCC Filings", agency: "WY Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://wyobiz.wyo.gov/Business/UCCSearch.aspx", icon: "FileText" },
];

export const WY_LICENSE_SOURCES: RecordSource[] = [
  { id: "wy_medical", name: "Medical License Verification", agency: "WY Board of Medicine", description: "Physicians licensed in Wyoming", searchUrl: "https://wyomedboard.wyo.gov/physicians/verify-a-license", icon: "Stethoscope" },
  { id: "wy_bar", name: "Attorney Search", agency: "WY State Bar", description: "Licensed attorneys in Wyoming", searchUrl: "https://www.wyomingbar.org/public/find-a-lawyer/", icon: "Scale" },
];

export const WY_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "wy_sos_cf", name: "WY Campaign Finance", agency: "WY Secretary of State", description: "Campaign finance reports", searchUrl: "https://www.wycampaignfinance.gov/WYCFWebApplication/", icon: "Vote" },
];

export const WY_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Laramie", label: "Laramie County Assessor", url: "https://www.laramiecounty.com/departments/assessor" },
  { county: "Natrona", label: "Natrona County Assessor", url: "https://www.natronacounty-wy.gov/government/assessor" },
  { county: "Campbell", label: "Campbell County Assessor", url: "https://www.ccgov.net/196/Assessor" },
  { county: "Teton", label: "Teton County Assessor", url: "https://www.tetoncountywy.gov/197/Assessor" },
];
