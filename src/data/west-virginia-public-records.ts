import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const WV_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "wv_sos_corps", name: "Business Entity Search", agency: "WV Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://apps.wv.gov/sos/businessentitysearch/?searchTerm=${name}" },
  { id: "wv_courts", name: "Court Case Search", agency: "WV Judiciary", description: "Circuit and magistrate court records", searchUrl: "https://www.courtswv.gov/lower-courts/case-activity-record-search", icon: "Gavel" },
  { id: "wv_doc", name: "Offender Search", agency: "WV DOC", description: "Current inmates in West Virginia", searchUrl: "https://apps.wv.gov/ois/offendersearch/", icon: "ShieldAlert" },
  { id: "wv_sex_offenders", name: "Sex Offender Registry", agency: "WV State Police", description: "Registered sex offenders in West Virginia", searchUrl: "https://www.wvstatepolice.gov/sexoffenderregistry/", icon: "AlertTriangle" },
  { id: "wv_voter", name: "Voter Registration", agency: "WV Secretary of State", description: "Voter registration status", searchUrl: "https://ovr.sos.wv.gov/Register/Landing", icon: "Vote" },
  { id: "wv_ucc", name: "UCC Filings", agency: "WV Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://apps.wv.gov/sos/uccsearch/", icon: "FileText" },
];

export const WV_LICENSE_SOURCES: RecordSource[] = [
  { id: "wv_medical", name: "Medical License Verification", agency: "WV Board of Medicine", description: "Physicians licensed in West Virginia", searchUrl: "https://www.wvbom.com/licensee-lookup.asp", icon: "Stethoscope" },
  { id: "wv_bar", name: "Attorney Search", agency: "WV State Bar", description: "Licensed attorneys in West Virginia", searchUrl: "https://www.wvbar.org/find-an-attorney/", icon: "Scale" },
];

export const WV_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "wv_sos_cf", name: "WV Campaign Finance", agency: "WV Secretary of State", description: "Campaign contributions and expenditures", searchUrl: "https://cfrs.wvsos.gov/index.html#/exploreData", icon: "Vote" },
];

export const WV_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Kanawha", label: "Kanawha County Assessor", url: "https://kanawha.softwaresystems.com/" },
  { county: "Berkeley", label: "Berkeley County Assessor", url: "https://berkeleywv.org/assessor/" },
  { county: "Cabell", label: "Cabell County Assessor", url: "https://cabellassessor.com/" },
  { county: "Monongalia", label: "Monongalia County", url: "https://www.monongaliacountyassessor.com/" },
];
