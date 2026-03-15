import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const NJ_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "nj_treasury_corps", name: "Business Entity Search", agency: "NJ Division of Revenue", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://www.njportal.com/DOR/BusinessNameSearch/Search/BusinessName?searchTerm=${name}" },
  { id: "nj_courts", name: "Court Case Search", agency: "NJ Judiciary", description: "Civil, criminal, and municipal court records", searchUrl: "https://portal.njcourts.gov/webe5/ExternalPGPA/CivilCaseJacket", icon: "Gavel" },
  { id: "nj_doc", name: "Inmate Search", agency: "NJ DOC", description: "Current inmates in New Jersey facilities", searchUrl: "https://www20.state.nj.us/DOC_Inmate/inmatesearchInput.jsp", icon: "ShieldAlert" },
  { id: "nj_sex_offenders", name: "Sex Offender Registry", agency: "NJ State Police", description: "Registered sex offenders in New Jersey", searchUrl: "https://www.njsp.org/sex-offender-registry/", icon: "AlertTriangle" },
  { id: "nj_voter", name: "Voter Registration", agency: "NJ Division of Elections", description: "Voter registration status", searchUrl: "https://voter.svrs.nj.gov/registration-check", icon: "Vote" },
  { id: "nj_ucc", name: "UCC Filings", agency: "NJ Division of Revenue", description: "Uniform Commercial Code financing statements", searchUrl: "https://www.njportal.com/DOR/UCCSearch", icon: "FileText" },
];

export const NJ_LICENSE_SOURCES: RecordSource[] = [
  { id: "nj_dca", name: "Professional License Lookup", agency: "NJ DCA", description: "Various professional and occupational licenses", searchUrl: "https://newjersey.mylicense.com/verification/Search.aspx", icon: "Briefcase" },
  { id: "nj_bar", name: "Attorney Search", agency: "NJ Judiciary", description: "Licensed attorneys in New Jersey", searchUrl: "https://portal.njcourts.gov/webe5/attorneyindex/", icon: "Scale" },
];

export const NJ_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "nj_elec_cf", name: "NJ Campaign Finance (ELEC)", agency: "NJ ELEC", description: "Campaign contributions and expenditures", searchUrl: "https://www.elec.state.nj.us/publicinformation/searchdatabase.htm", icon: "Vote" },
];

export const NJ_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Bergen", label: "Bergen County", url: "https://www.co.bergen.nj.us/board-of-taxation" },
  { county: "Essex", label: "Essex County", url: "https://essexcountynj.gov/board-of-taxation/" },
  { county: "Hudson", label: "Hudson County", url: "https://www.hudsoncountynj.org/board-of-taxation/" },
  { county: "Middlesex", label: "Middlesex County", url: "https://www.middlesexcountynj.gov/Government/Departments/BOT/Pages/default.aspx" },
  { county: "Monmouth", label: "Monmouth County", url: "https://www.co.monmouth.nj.us/page.aspx?Id=2490" },
  { county: "Union", label: "Union County", url: "https://ucnj.org/board-of-taxation/" },
  { county: "Camden", label: "Camden County", url: "https://camdencountynj.gov/tax-board/" },
  { county: "Morris", label: "Morris County", url: "https://www.morriscountynj.gov/Departments/Board-of-Taxation" },
];
