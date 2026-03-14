import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const IL_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "il_sos_corps", name: "Business Entity Search", agency: "IL Secretary of State", description: "Corporations, LLCs, LPs, and assumed names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://apps.ilsos.gov/corporatellc/CorporateLlcController?command=masterSearchForm&searchType=all&searchTerm=${name}" },
  { id: "il_courts", name: "Court Case Search", agency: "IL Courts", description: "Circuit court case records", searchUrl: "https://www.illinoiscourts.gov/courts-directory/", icon: "Gavel" },
  { id: "il_doc", name: "Inmate Search", agency: "IL DOC", description: "Current inmates in Illinois state prisons", searchUrl: "https://www.idoc.state.il.us/subsections/search/default.asp", icon: "ShieldAlert" },
  { id: "il_sex_offenders", name: "Sex Offender Registry", agency: "IL State Police", description: "Registered sex offenders in Illinois", searchUrl: "https://isp.illinois.gov/Sor", icon: "AlertTriangle" },
  { id: "il_voter", name: "Voter Registration", agency: "IL State Board of Elections", description: "Voter registration status", searchUrl: "https://ova.elections.il.gov/RegistrationLookup.aspx", icon: "Vote" },
  { id: "il_ucc", name: "UCC Filings", agency: "IL Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://apps.ilsos.gov/uccitssearch/", icon: "FileText" },
];

export const IL_LICENSE_SOURCES: RecordSource[] = [
  { id: "il_idfpr", name: "Professional License Lookup", agency: "IL IDFPR", description: "Doctors, nurses, real estate, contractors, and more", searchUrl: "https://online-dfpr.micropact.com/lookup/licenselookup.aspx", icon: "Briefcase" },
  { id: "il_ardc", name: "Attorney Search", agency: "IL ARDC", description: "Licensed attorneys in Illinois", searchUrl: "https://www.iardc.org/lawyersearch.asp", icon: "Scale" },
];

export const IL_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "il_sboe_cf", name: "IL Campaign Finance", agency: "IL State Board of Elections", description: "Campaign contributions and expenditures", searchUrl: "https://www.elections.il.gov/CampaignDisclosure/ContributionSearchByAllContributions.aspx", icon: "Vote" },
];

export const IL_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Cook", label: "Cook County Assessor", url: "https://www.cookcountyassessor.com/" },
  { county: "DuPage", label: "DuPage County", url: "https://www.dupagecounty.gov/property_info/" },
  { county: "Lake", label: "Lake County", url: "https://www.lakecountyil.gov/162/Assessments" },
  { county: "Will", label: "Will County", url: "https://www.willcountysoa.com/" },
  { county: "Kane", label: "Kane County", url: "https://kanecountyassessments.org/" },
  { county: "McHenry", label: "McHenry County", url: "https://www.mchenrycountyil.gov/county-government/departments-a-i/assessment" },
  { county: "Winnebago", label: "Winnebago County", url: "https://www.wincoil.gov/departments/supervisor-of-assessments" },
  { county: "Madison", label: "Madison County", url: "https://www.co.madison.il.us/departments/chief_county_assessment_office/index.php" },
];
