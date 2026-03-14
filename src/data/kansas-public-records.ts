import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const KS_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "ks_sos_corps", name: "Business Entity Search", agency: "KS Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://www.kansas.gov/bess/flow/main?execution=e1s1&_search=${name}" },
  { id: "ks_courts", name: "Court Case Search", agency: "KS Judicial Branch", description: "District court case records", searchUrl: "https://www.kscourts.org/Cases-Opinions/Electronic-Filing-and-Case-Access", icon: "Gavel" },
  { id: "ks_doc", name: "Offender Search (KASPER)", agency: "KS DOC", description: "Current inmates in Kansas facilities", searchUrl: "https://kdocrepository.doc.ks.gov/kasper/", icon: "ShieldAlert" },
  { id: "ks_sex_offenders", name: "Sex Offender Registry", agency: "KBI", description: "Registered sex offenders in Kansas", searchUrl: "https://www.kbi.ks.gov/registeredoffender/", icon: "AlertTriangle" },
  { id: "ks_voter", name: "Voter Registration", agency: "KS Secretary of State", description: "Voter registration status", searchUrl: "https://myvoteinfo.voteks.org/voterview", icon: "Vote" },
  { id: "ks_ucc", name: "UCC Filings", agency: "KS Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://www.kansas.gov/bess/flow/main", icon: "FileText" },
];

export const KS_LICENSE_SOURCES: RecordSource[] = [
  { id: "ks_ksbha", name: "Medical License Verification", agency: "KS Board of Healing Arts", description: "Physicians and other medical licenses", searchUrl: "https://www.ksbha.org/verify.shtml", icon: "Stethoscope" },
  { id: "ks_bar", name: "Attorney Search", agency: "KS Judicial Branch", description: "Licensed attorneys in Kansas", searchUrl: "https://www.kscourts.org/Attorneys-and-Judges/Attorney-Directory", icon: "Scale" },
];

export const KS_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "ks_ethics_cf", name: "KS Campaign Finance", agency: "KS Governmental Ethics Commission", description: "Campaign contributions and expenditures", searchUrl: "https://ethics.kansas.gov/Campaign-Finance/", icon: "Vote" },
];

export const KS_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Johnson", label: "Johnson County Appraiser", url: "https://www.jocogov.org/dept/appraiser/search-property-information" },
  { county: "Sedgwick", label: "Sedgwick County Appraiser", url: "https://www.sedgwickcounty.org/appraiser/" },
  { county: "Shawnee", label: "Shawnee County Appraiser", url: "https://www.snco.us/appraiser/" },
  { county: "Douglas", label: "Douglas County Appraiser", url: "https://www.douglascountyks.org/depts/appraiser" },
  { county: "Wyandotte", label: "Wyandotte County", url: "https://www.wycokck.org/Departments/Appraiser" },
];
