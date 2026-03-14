import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const NM_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "nm_sos_corps", name: "Business Entity Search", agency: "NM Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://portal.sos.state.nm.us/BFS/online/CorporationBusinessSearch/CorporationBusinessSearch?searchTerm=${name}" },
  { id: "nm_courts", name: "Court Case Search", agency: "NM Courts", description: "District and magistrate court records", searchUrl: "https://caselookup.nmcourts.gov/caselookup/", icon: "Gavel" },
  { id: "nm_doc", name: "Offender Search", agency: "NM Corrections Dept.", description: "Current inmates in New Mexico", searchUrl: "https://cd.nm.gov/offender-search/", icon: "ShieldAlert" },
  { id: "nm_sex_offenders", name: "Sex Offender Registry", agency: "NM DPS", description: "Registered sex offenders in New Mexico", searchUrl: "https://www.nmsexoffender.dps.state.nm.us/", icon: "AlertTriangle" },
  { id: "nm_voter", name: "Voter Registration", agency: "NM Secretary of State", description: "Voter registration status", searchUrl: "https://voterportal.servis.sos.state.nm.us/WhereToVote.aspx", icon: "Vote" },
  { id: "nm_ucc", name: "UCC Filings", agency: "NM Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://portal.sos.state.nm.us/BFS/online/UCCSearch", icon: "FileText" },
];

export const NM_LICENSE_SOURCES: RecordSource[] = [
  { id: "nm_rld", name: "Professional License Lookup", agency: "NM RLD", description: "Various professional and occupational licenses", searchUrl: "https://www.rld.nm.gov/boards-and-commissions/", icon: "Briefcase" },
  { id: "nm_bar", name: "Attorney Search", agency: "NM Supreme Court", description: "Licensed attorneys in New Mexico", searchUrl: "https://nmsupremecourt.nmcourts.gov/attorney-inquiry.aspx", icon: "Scale" },
];

export const NM_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "nm_sos_cf", name: "NM Campaign Finance", agency: "NM Secretary of State", description: "Campaign contributions and expenditures", searchUrl: "https://login.cfis.sos.state.nm.us/#/exploreData", icon: "Vote" },
];

export const NM_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Bernalillo", label: "Bernalillo County Assessor", url: "https://www.bernco.gov/assessor/" },
  { county: "Doña Ana", label: "Doña Ana County Assessor", url: "https://www.donaanacounty.org/assessor" },
  { county: "Santa Fe", label: "Santa Fe County Assessor", url: "https://www.santafecountynm.gov/assessor" },
  { county: "Sandoval", label: "Sandoval County Assessor", url: "https://www.sandovalcountynm.gov/assessor/" },
];
