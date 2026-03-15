import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const LA_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "la_sos_corps", name: "Business Entity Search", agency: "LA Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://coraweb.sos.la.gov/CommercialSearch/CommercialSearch.aspx?searchterm=${name}" },
  { id: "la_courts", name: "Court Case Search", agency: "LA Supreme Court", description: "District court case records", searchUrl: "https://www.lasc.org/courts", icon: "Gavel" },
  { id: "la_doc", name: "Offender Search", agency: "LA DOC", description: "Current inmates in Louisiana facilities", searchUrl: "https://doc.louisiana.gov/resources/imprisoned-person-locator/", icon: "ShieldAlert" },
  { id: "la_sex_offenders", name: "Sex Offender Registry", agency: "LA State Police", description: "Registered sex offenders in Louisiana", searchUrl: "https://www.icrimewatch.net/louisiana.php", icon: "AlertTriangle" },
  { id: "la_voter", name: "Voter Registration", agency: "LA Secretary of State", description: "Voter registration status", searchUrl: "https://voterportal.sos.la.gov/Home/VoterLogin", icon: "Vote" },
  { id: "la_ucc", name: "UCC Filings", agency: "LA Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://coraweb.sos.la.gov/uccsearch/uccsearch.aspx", icon: "FileText" },
];

export const LA_LICENSE_SOURCES: RecordSource[] = [
  { id: "la_lsbme", name: "Medical License Verification", agency: "LA State Board of Medical Examiners", description: "Physicians licensed in Louisiana", searchUrl: "https://www.lsbme.la.gov/apps/appsSearch.aspx", icon: "Stethoscope" },
  { id: "la_bar", name: "Attorney Search", agency: "LA State Bar Association", description: "Licensed attorneys in Louisiana", searchUrl: "https://www.lsba.org/public/find-a-lawyer.aspx", icon: "Scale" },
];

export const LA_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "la_ethics_cf", name: "LA Campaign Finance", agency: "LA Ethics Administration", description: "Campaign contributions and expenditures", searchUrl: "https://www.ethics.la.gov/CampFinanHome.aspx", icon: "Vote" },
];

export const LA_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Orleans", label: "Orleans Parish Assessor", url: "https://nolaassessor.com/" },
  { county: "Jefferson", label: "Jefferson Parish Assessor", url: "https://www.jpassessor.com/" },
  { county: "East Baton Rouge", label: "EBR Parish Assessor", url: "https://www.ebrpa.org/" },
  { county: "Caddo", label: "Caddo Parish Assessor", url: "https://www.caddoassessor.org/" },
  { county: "St. Tammany", label: "St. Tammany Assessor", url: "https://www.stassessor.org/" },
];
