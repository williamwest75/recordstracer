import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const TN_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "tn_sos_corps", name: "Business Entity Search", agency: "TN Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://tnbear.tn.gov/ECommerce/FilingSearch.aspx?searchTerm=${name}" },
  { id: "tn_courts", name: "Court Case Search", agency: "TN Courts", description: "Civil, criminal, and appellate court records", searchUrl: "https://www.tncourts.gov/programs/case-management", icon: "Gavel" },
  { id: "tn_doc", name: "Inmate Search (FOIL)", agency: "TN DOC", description: "Current inmates in Tennessee facilities", searchUrl: "https://apps.tn.gov/foil-app/search.jsp", icon: "ShieldAlert" },
  { id: "tn_sex_offenders", name: "Sex Offender Registry", agency: "TBI", description: "Registered sex offenders in Tennessee", searchUrl: "https://sor.tbi.tn.gov/SOMainpg.aspx", icon: "AlertTriangle" },
  { id: "tn_voter", name: "Voter Registration", agency: "TN Secretary of State", description: "Voter registration status", searchUrl: "https://tnmap.tn.gov/voterlookup/", icon: "Vote" },
  { id: "tn_ucc", name: "UCC Filings", agency: "TN Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://tnbear.tn.gov/UCC/UCCSearch.aspx", icon: "FileText" },
];

export const TN_LICENSE_SOURCES: RecordSource[] = [
  { id: "tn_health", name: "Professional License Lookup", agency: "TN Division of Health Licensure", description: "Doctors, nurses, and health professionals", searchUrl: "https://apps.health.tn.gov/Licensure/default.aspx", icon: "Stethoscope" },
  { id: "tn_bar", name: "Attorney Search", agency: "TN Board of Professional Responsibility", description: "Licensed attorneys in Tennessee", searchUrl: "https://www.tbpr.org/attorneys", icon: "Scale" },
];

export const TN_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "tn_ethics_cf", name: "TN Campaign Finance", agency: "TN Bureau of Ethics & Campaign Finance", description: "Campaign contributions and expenditures", searchUrl: "https://apps.tn.gov/tncamp-app/public/search.htm", icon: "Vote" },
];

export const TN_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Davidson", label: "Davidson County (Nashville)", url: "https://www.padctn.org/" },
  { county: "Shelby", label: "Shelby County (Memphis)", url: "https://www.shelbycountytn.gov/property-assessment-appeals-tax-office" },
  { county: "Knox", label: "Knox County (Knoxville)", url: "https://www.knoxcounty.org/assessor/property_search.php" },
  { county: "Hamilton", label: "Hamilton County (Chattanooga)", url: "https://assessor.hamiltontn.gov/" },
  { county: "Rutherford", label: "Rutherford County", url: "https://www.rutherfordcountytn.gov/assessor" },
  { county: "Williamson", label: "Williamson County", url: "https://www.williamsoncounty-tn.gov/government/property-assessor" },
];
