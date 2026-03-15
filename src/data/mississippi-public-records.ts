import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const MS_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "ms_sos_corps", name: "Business Entity Search", agency: "MS Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://corp.sos.ms.gov/corp/portal/c/page/corpBusinessIdSearch/portal.aspx?q=${name}" },
  { id: "ms_courts", name: "Court Case Search", agency: "MS Administrative Office of Courts", description: "Circuit and county court records", searchUrl: "https://courts.ms.gov/mec/mec.php", icon: "Gavel" },
  { id: "ms_doc", name: "Inmate Search", agency: "MS DOC", description: "Current inmates in Mississippi facilities", searchUrl: "https://www.mdoc.ms.gov/Adult-Offender/Pages/Inmate-Search.aspx", icon: "ShieldAlert" },
  { id: "ms_sex_offenders", name: "Sex Offender Registry", agency: "MS DPS", description: "Registered sex offenders in Mississippi", searchUrl: "https://state.sor.dps.ms.gov/", icon: "AlertTriangle" },
  { id: "ms_voter", name: "Voter Registration", agency: "MS Secretary of State", description: "Voter registration status", searchUrl: "https://www.msegov.com/sos/voter_registration/AmIRegistered", icon: "Vote" },
  { id: "ms_ucc", name: "UCC Filings", agency: "MS Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://corp.sos.ms.gov/ucc/portal/", icon: "FileText" },
];

export const MS_LICENSE_SOURCES: RecordSource[] = [
  { id: "ms_medical", name: "Medical License Verification", agency: "MS State Board of Medical Licensure", description: "Physicians licensed in Mississippi", searchUrl: "https://gateway.ms.gov/MBS/App/LicenseSearch.aspx", icon: "Stethoscope" },
  { id: "ms_bar", name: "Attorney Search", agency: "MS Bar", description: "Licensed attorneys in Mississippi", searchUrl: "https://www.msbar.org/for-the-public/lawyer-directory/", icon: "Scale" },
];

export const MS_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "ms_sos_cf", name: "MS Campaign Finance", agency: "MS Secretary of State", description: "Campaign finance reports", searchUrl: "https://cfportal.sos.ms.gov/online/portal/cf/page/cf-search/Portal.aspx", icon: "Vote" },
];

export const MS_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Hinds", label: "Hinds County", url: "https://www.co.hinds.ms.us/pgs/apps/tax/tax.asp" },
  { county: "Harrison", label: "Harrison County", url: "https://www.co.harrison.ms.us/departments/tax-assessor" },
  { county: "DeSoto", label: "DeSoto County", url: "https://www.desotocountyms.gov/government/assessor" },
  { county: "Rankin", label: "Rankin County", url: "https://www.rankincounty.org/government/tax-assessor-collector" },
];
