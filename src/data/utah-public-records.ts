import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const UT_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "ut_commerce_corps", name: "Business Entity Search", agency: "UT Division of Corporations", description: "Corporations, LLCs, LPs, and DBAs", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://secure.utah.gov/bes/index.html?searchTerm=${name}" },
  { id: "ut_courts", name: "Court Case Search (XChange)", agency: "UT Courts", description: "Civil, criminal, and juvenile court records", searchUrl: "https://www.utcourts.gov/xchange/", icon: "Gavel" },
  { id: "ut_doc", name: "Offender Search", agency: "UT DOC", description: "Current inmates in Utah facilities", searchUrl: "https://corrections.utah.gov/index.php/offender-search", icon: "ShieldAlert" },
  { id: "ut_sex_offenders", name: "Sex Offender Registry", agency: "UT DPS", description: "Registered sex offenders in Utah", searchUrl: "https://www.icrimewatch.net/index.php?AgencyID=54438", icon: "AlertTriangle" },
  { id: "ut_voter", name: "Voter Registration", agency: "UT Lt. Governor", description: "Voter registration status", searchUrl: "https://votesearch.utah.gov/voter-search/search/search-by-voter/voter-info", icon: "Vote" },
  { id: "ut_ucc", name: "UCC Filings", agency: "UT Division of Corporations", description: "Uniform Commercial Code financing statements", searchUrl: "https://secure.utah.gov/uccs/", icon: "FileText" },
];

export const UT_LICENSE_SOURCES: RecordSource[] = [
  { id: "ut_dopl", name: "Professional License Lookup", agency: "UT DOPL", description: "Doctors, nurses, real estate, contractors, and more", searchUrl: "https://secure.utah.gov/llv/", icon: "Briefcase" },
  { id: "ut_bar", name: "Attorney Search", agency: "UT State Bar", description: "Licensed attorneys in Utah", searchUrl: "https://services.utahbar.org/Member-Directory", icon: "Scale" },
];

export const UT_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "ut_ltgov_cf", name: "UT Campaign Finance", agency: "UT Lt. Governor", description: "Campaign contributions and expenditures", searchUrl: "https://disclosures.utah.gov/Search/AdvancedSearch", icon: "Vote" },
];

export const UT_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Salt Lake", label: "Salt Lake County Assessor", url: "https://slco.org/assessor/" },
  { county: "Utah", label: "Utah County Assessor", url: "https://www.utahcounty.gov/Dept/Assess/" },
  { county: "Davis", label: "Davis County Assessor", url: "https://www.daviscountyutah.gov/assessor" },
  { county: "Weber", label: "Weber County Assessor", url: "https://www.webercountyutah.gov/assessor/" },
  { county: "Washington", label: "Washington County Assessor", url: "https://www.washco.utah.gov/assessor/" },
  { county: "Cache", label: "Cache County Assessor", url: "https://www.cachecounty.org/assessor/" },
];
