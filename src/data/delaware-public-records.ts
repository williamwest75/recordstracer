import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const DE_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "de_dos_corps", name: "Business Entity Search", agency: "DE Division of Corporations", description: "Corporations, LLCs, LPs — the incorporation capital", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx?EntityName=${name}" },
  { id: "de_courts", name: "Court Case Search", agency: "DE Courts", description: "Civil, criminal, and family court records", searchUrl: "https://courts.delaware.gov/caseinfo/", icon: "Gavel" },
  { id: "de_doc", name: "Inmate Search", agency: "DE DOC", description: "Current inmates in Delaware facilities", searchUrl: "https://www.vinelink.com/#/home/site/9000", icon: "ShieldAlert" },
  { id: "de_sex_offenders", name: "Sex Offender Registry", agency: "DE State Police", description: "Registered sex offenders in Delaware", searchUrl: "https://sexoffender.dsp.delaware.gov/", icon: "AlertTriangle" },
  { id: "de_voter", name: "Voter Registration", agency: "DE Dept. of Elections", description: "Voter registration status", searchUrl: "https://ivote.de.gov/VoterView/RegistrantSearch.do", icon: "Vote" },
  { id: "de_ucc", name: "UCC Filings", agency: "DE Dept. of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://icis.corp.delaware.gov/ecorp/uccsearch/", icon: "FileText" },
];

export const DE_LICENSE_SOURCES: RecordSource[] = [
  { id: "de_dpr", name: "Professional License Lookup", agency: "DE Division of Professional Regulation", description: "Various professional licenses", searchUrl: "https://delpros.delaware.gov/OH_VerifyLicense", icon: "Briefcase" },
  { id: "de_bar", name: "Attorney Search", agency: "DE State Bar", description: "Licensed attorneys in Delaware", searchUrl: "https://www.dsba.org/find-a-lawyer/", icon: "Scale" },
];

export const DE_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "de_elections_cf", name: "DE Campaign Finance", agency: "DE Elections", description: "Campaign contributions and expenditures", searchUrl: "https://cfrs.elections.delaware.gov/", icon: "Vote" },
];

export const DE_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "New Castle", label: "New Castle County", url: "https://www.nccde.org/407/Property-Tax-Assessments" },
  { county: "Kent", label: "Kent County", url: "https://www.kentcountyde.gov/assessment" },
  { county: "Sussex", label: "Sussex County", url: "https://www.sussexcountyde.gov/assessment-office" },
];
