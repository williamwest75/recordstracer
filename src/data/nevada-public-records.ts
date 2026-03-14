import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const NV_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "nv_sos_corps", name: "Business Entity Search", agency: "NV Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://esos.nv.gov/EntitySearch/OnlineEntitySearch/Search?searchTerm=${name}" },
  { id: "nv_courts", name: "Court Case Search", agency: "NV Judiciary", description: "Civil, criminal, and family court records", searchUrl: "https://nvcourts.gov/Find_a_Court/", icon: "Gavel" },
  { id: "nv_doc", name: "Offender Search", agency: "NV DOC", description: "Current inmates in Nevada facilities", searchUrl: "https://ofdsearch.doc.nv.gov/form.php", icon: "ShieldAlert" },
  { id: "nv_sex_offenders", name: "Sex Offender Registry", agency: "NV DPS", description: "Registered sex offenders in Nevada", searchUrl: "https://www.nvsexoffenders.gov/Search.aspx", icon: "AlertTriangle" },
  { id: "nv_voter", name: "Voter Registration", agency: "NV Secretary of State", description: "Voter registration status", searchUrl: "https://www.nvsos.gov/votersearch/", icon: "Vote" },
  { id: "nv_ucc", name: "UCC Filings", agency: "NV Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://esos.nv.gov/UCCSearch/OnlineUCCSearch/Search", icon: "FileText" },
];

export const NV_LICENSE_SOURCES: RecordSource[] = [
  { id: "nv_medical", name: "Medical License Verification", agency: "NV State Board of Medical Examiners", description: "Physicians licensed in Nevada", searchUrl: "https://medboard.nv.gov/Licensee_Verification/", icon: "Stethoscope" },
  { id: "nv_bar", name: "Attorney Search", agency: "State Bar of Nevada", description: "Licensed attorneys in Nevada", searchUrl: "https://www.nvbar.org/find-a-lawyer/", icon: "Scale" },
];

export const NV_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "nv_sos_cf", name: "NV Campaign Finance", agency: "NV Secretary of State", description: "Campaign contributions and expenditures", searchUrl: "https://www.nvsos.gov/sos/elections/campaign-finance", icon: "Vote" },
];

export const NV_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Clark", label: "Clark County Assessor", url: "https://www.clarkcountynv.gov/government/assessor/index.php" },
  { county: "Washoe", label: "Washoe County Assessor", url: "https://www.washoecounty.gov/assessor/" },
  { county: "Carson City", label: "Carson City Assessor", url: "https://www.carson.org/residents/assessor" },
  { county: "Douglas", label: "Douglas County Assessor", url: "https://www.douglascountynv.gov/government/departments/assessor" },
];
