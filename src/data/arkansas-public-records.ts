import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const AR_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "ar_sos_corps", name: "Business Entity Search", agency: "AR Secretary of State", description: "Corporations, LLCs, and LPs", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://www.sos.arkansas.gov/corps/search_all.php?ESSION=${name}" },
  { id: "ar_courts", name: "Court Case Search", agency: "AR Administrative Office of Courts", description: "Circuit court case records", searchUrl: "https://caseinfo.arcourts.gov/cconnect/PROD/public/ck_public_qry_main.cp_main_idx", icon: "Gavel" },
  { id: "ar_doc", name: "Inmate Search", agency: "AR DOC", description: "Current inmates in Arkansas state prisons", searchUrl: "https://adc.arkansas.gov/inmate-population-information-search", icon: "ShieldAlert" },
  { id: "ar_sex_offenders", name: "Sex Offender Registry", agency: "AR Crime Information Center", description: "Registered sex offenders in Arkansas", searchUrl: "https://www.ark.org/asos/index.php", icon: "AlertTriangle" },
  { id: "ar_voter", name: "Voter Registration", agency: "AR Secretary of State", description: "Voter registration status", searchUrl: "https://www.voterview.ar-nova.org/VoterView/RegistrantSearch.do", icon: "Vote" },
  { id: "ar_ucc", name: "UCC Filings", agency: "AR Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://www.sos.arkansas.gov/ucc-filings", icon: "FileText" },
];

export const AR_LICENSE_SOURCES: RecordSource[] = [
  { id: "ar_medical", name: "Medical License Verification", agency: "AR State Medical Board", description: "Physicians licensed in Arkansas", searchUrl: "https://www.armedicalboard.org/public/verify/default.aspx", icon: "Stethoscope" },
  { id: "ar_bar", name: "Attorney Search", agency: "AR Judiciary", description: "Licensed attorneys in Arkansas", searchUrl: "https://www.arcourts.gov/courts/professional-conduct/find-attorney", icon: "Scale" },
];

export const AR_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "ar_sos_cf", name: "AR Campaign Finance", agency: "AR Secretary of State", description: "Campaign contributions and expenditure reports", searchUrl: "https://ethics-disclosures.sos.arkansas.gov/login", icon: "Vote" },
];

export const AR_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Pulaski", label: "Pulaski County Assessor", url: "https://www.pulaskicountyassessor.net/" },
  { county: "Benton", label: "Benton County Assessor", url: "https://www.bentoncountyar.gov/assessor" },
  { county: "Washington", label: "Washington County", url: "https://www.washingtoncountyar.gov/government/county-assessor" },
  { county: "Sebastian", label: "Sebastian County", url: "https://www.sebastiancountyar.gov/government/assessor" },
];
