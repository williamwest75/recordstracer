import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const CO_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "co_sos_corps", name: "Business Entity Search", agency: "CO Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://www.sos.state.co.us/biz/BusinessEntityCriteriaExt.do?nameTyp=ENTITY&entityName=${name}&srchTyp=ENTITY" },
  { id: "co_courts", name: "Court Case Search", agency: "CO Judicial Branch", description: "Civil, criminal, and county court records", searchUrl: "https://www.courts.state.co.us/dockets/index.cfm", icon: "Gavel" },
  { id: "co_doc", name: "Offender Search", agency: "CO DOC", description: "Current inmates in Colorado state prisons", searchUrl: "https://www.doc.state.co.us/oss/", icon: "ShieldAlert" },
  { id: "co_sex_offenders", name: "Sex Offender Registry", agency: "CO CBI", description: "Registered sex offenders in Colorado", searchUrl: "https://apps.colorado.gov/apps/dps/sex-offender-search/", icon: "AlertTriangle" },
  { id: "co_voter", name: "Voter Registration", agency: "CO Secretary of State", description: "Voter registration status", searchUrl: "https://www.sos.state.co.us/voter/pages/pub/olvr/findVoterReg.xhtml", icon: "Vote" },
  { id: "co_ucc", name: "UCC Filings", agency: "CO Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://www.sos.state.co.us/biz/UCCSearchCriteria.do", icon: "FileText" },
];

export const CO_LICENSE_SOURCES: RecordSource[] = [
  { id: "co_dora", name: "Professional License Lookup", agency: "CO DORA", description: "Doctors, nurses, real estate, and more", searchUrl: "https://apps.colorado.gov/dora/licensing/Lookup/LicenseLookup.aspx", icon: "Briefcase" },
  { id: "co_bar", name: "Attorney Search", agency: "CO Supreme Court", description: "Licensed attorneys in Colorado", searchUrl: "https://www.coloradosupremecourt.com/Search/AttSearch.asp", icon: "Scale" },
];

export const CO_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "co_tracer", name: "CO Campaign Finance (TRACER)", agency: "CO Secretary of State", description: "Campaign contributions and expenditures", searchUrl: "https://tracer.sos.colorado.gov/PublicSite/SearchPages/SearchByCandidate.aspx", icon: "Vote" },
];

export const CO_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Denver", label: "Denver Assessor", url: "https://www.denvergov.org/property" },
  { county: "El Paso", label: "El Paso County Assessor", url: "https://assessor.elpasoco.com/" },
  { county: "Arapahoe", label: "Arapahoe County Assessor", url: "https://www.arapahoegov.com/assessor" },
  { county: "Jefferson", label: "Jefferson County Assessor", url: "https://www.jeffco.us/assessor" },
  { county: "Adams", label: "Adams County Assessor", url: "https://www.adcogov.org/assessor" },
  { county: "Douglas", label: "Douglas County Assessor", url: "https://www.douglas.co.us/assessor/" },
  { county: "Larimer", label: "Larimer County Assessor", url: "https://www.larimer.gov/assessor" },
  { county: "Boulder", label: "Boulder County Assessor", url: "https://www.bouldercounty.org/property-and-land/assessor/" },
];
