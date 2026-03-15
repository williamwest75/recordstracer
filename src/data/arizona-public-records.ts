import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const AZ_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "az_acc_corps", name: "Business Entity Search", agency: "AZ Corporation Commission", description: "Corporations, LLCs, and LPs", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://ecorp.azcc.gov/EntitySearch/Index?businessName=${name}" },
  { id: "az_courts", name: "Court Case Search", agency: "AZ Judicial Branch", description: "Superior court case records", searchUrl: "https://apps.azcourts.gov/publicaccess/caselookup.aspx", icon: "Gavel" },
  { id: "az_doc", name: "Inmate Search", agency: "AZ DOC", description: "Current inmates in Arizona state prisons", searchUrl: "https://corrections.az.gov/inmate-datasearch", icon: "ShieldAlert" },
  { id: "az_sex_offenders", name: "Sex Offender Registry", agency: "AZ DPS", description: "Registered sex offenders in Arizona", searchUrl: "https://www.azdps.gov/services/public/sex_offender", icon: "AlertTriangle" },
  { id: "az_voter", name: "Voter Registration", agency: "AZ Secretary of State", description: "Voter registration status", searchUrl: "https://voter.azsos.gov/VoterView/RegistrantSearch.do", icon: "Vote" },
  { id: "az_ucc", name: "UCC Filings", agency: "AZ Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://apps.azsos.gov/apps/uccSearch/", icon: "FileText" },
];

export const AZ_LICENSE_SOURCES: RecordSource[] = [
  { id: "az_medical", name: "Medical License Verification", agency: "AZ Medical Board", description: "Physicians licensed in Arizona", searchUrl: "https://www.azmd.gov/glsuiteweb/clients/azmd/public/datamart/home.aspx", icon: "Stethoscope" },
  { id: "az_bar", name: "Attorney Search", agency: "State Bar of Arizona", description: "Licensed attorneys in Arizona", searchUrl: "https://www.azbar.org/for-the-public/find-a-lawyer/", icon: "Scale" },
  { id: "az_roc", name: "Contractor License Lookup", agency: "AZ ROC", description: "Licensed contractors in Arizona", searchUrl: "https://roc.az.gov/contractor-search", icon: "Briefcase" },
];

export const AZ_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "az_sos_cf", name: "AZ Campaign Finance", agency: "AZ Secretary of State", description: "Campaign contributions and expenditures", searchUrl: "https://apps.azsos.gov/apps/election/cfs/search/Search.aspx", icon: "Vote" },
];

export const AZ_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Maricopa", label: "Maricopa County Assessor", url: "https://mcassessor.maricopa.gov/" },
  { county: "Pima", label: "Pima County Assessor", url: "https://www.asr.pima.gov/" },
  { county: "Pinal", label: "Pinal County Assessor", url: "https://www.pinalcountyaz.gov/Assessor/" },
  { county: "Yavapai", label: "Yavapai County Assessor", url: "https://www.yavapaiaz.gov/Departments/Assessor" },
  { county: "Coconino", label: "Coconino County Assessor", url: "https://www.coconino.az.gov/150/Assessor" },
];
