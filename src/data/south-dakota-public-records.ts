import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const SD_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "sd_sos_corps", name: "Business Entity Search", agency: "SD Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://sosenterprise.sd.gov/BusinessServices/Business/FilingSearch.aspx?searchTerm=${name}" },
  { id: "sd_courts", name: "Court Case Search", agency: "SD UJS", description: "Circuit court case records", searchUrl: "https://ujs.sd.gov/Search/", icon: "Gavel" },
  { id: "sd_doc", name: "Offender Search", agency: "SD DOC", description: "Current inmates in South Dakota", searchUrl: "https://doc.sd.gov/adult/offender-search/", icon: "ShieldAlert" },
  { id: "sd_sex_offenders", name: "Sex Offender Registry", agency: "SD Attorney General", description: "Registered sex offenders in South Dakota", searchUrl: "https://sor.sd.gov/", icon: "AlertTriangle" },
  { id: "sd_voter", name: "Voter Registration", agency: "SD Secretary of State", description: "Voter registration status", searchUrl: "https://vip.sdsos.gov/VIPLogin.aspx", icon: "Vote" },
  { id: "sd_ucc", name: "UCC Filings", agency: "SD Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://sosenterprise.sd.gov/BusinessServices/UCC/UCCSearch.aspx", icon: "FileText" },
];

export const SD_LICENSE_SOURCES: RecordSource[] = [
  { id: "sd_medical", name: "Medical License Verification", agency: "SD Board of Medical & Osteopathic Examiners", description: "Physicians licensed in South Dakota", searchUrl: "https://www.sdbmoe.gov/public/find-a-licensee", icon: "Stethoscope" },
  { id: "sd_bar", name: "Attorney Search", agency: "State Bar of SD", description: "Licensed attorneys in South Dakota", searchUrl: "https://www.statebarofsouthdakota.com/for-the-public/find-a-lawyer", icon: "Scale" },
];

export const SD_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "sd_sos_cf", name: "SD Campaign Finance", agency: "SD Secretary of State", description: "Campaign finance reports", searchUrl: "https://sosenterprise.sd.gov/CampaignFinance/", icon: "Vote" },
];

export const SD_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Minnehaha", label: "Minnehaha County", url: "https://www.minnehahacounty.org/dept/eq/eq.aspx" },
  { county: "Pennington", label: "Pennington County", url: "https://www.pennco.org/government/equalization" },
  { county: "Lincoln", label: "Lincoln County", url: "https://www.lincolncountysd.org/119/Equalization" },
  { county: "Brown", label: "Brown County", url: "https://www.brownsd.gov/equalization" },
];
