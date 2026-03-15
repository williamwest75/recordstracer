import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const WA_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "wa_sos_corps", name: "Business Entity Search", agency: "WA Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://ccfs.sos.wa.gov/#/BusinessSearch?searchText=${name}" },
  { id: "wa_courts", name: "Court Case Search", agency: "WA Courts", description: "Superior, district, and municipal court records", searchUrl: "https://dw.courts.wa.gov/", icon: "Gavel" },
  { id: "wa_doc", name: "Offender Search", agency: "WA DOC", description: "Current inmates in Washington facilities", searchUrl: "https://www.doc.wa.gov/information/inmate-search/default.aspx", icon: "ShieldAlert" },
  { id: "wa_sex_offenders", name: "Sex Offender Registry", agency: "WA Association of Sheriffs & Police Chiefs", description: "Registered sex offenders in Washington", searchUrl: "https://www.waspc.org/sex-offender-information", icon: "AlertTriangle" },
  { id: "wa_voter", name: "Voter Registration", agency: "WA Secretary of State", description: "Voter registration status", searchUrl: "https://voter.votewa.gov/WhereToVote.aspx", icon: "Vote" },
  { id: "wa_ucc", name: "UCC Filings", agency: "WA Dept. of Licensing", description: "Uniform Commercial Code financing statements", searchUrl: "https://fortress.wa.gov/dol/ucc/", icon: "FileText" },
];

export const WA_LICENSE_SOURCES: RecordSource[] = [
  { id: "wa_dol", name: "Professional License Lookup", agency: "WA Dept. of Licensing", description: "Various professional and business licenses", searchUrl: "https://www.dol.wa.gov/professional-licenses/verify-a-license", icon: "Briefcase" },
  { id: "wa_bar", name: "Attorney Search", agency: "WA State Bar Association", description: "Licensed attorneys in Washington", searchUrl: "https://www.mywsba.org/for-the-public/find-a-lawyer/", icon: "Scale" },
];

export const WA_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "wa_pdc", name: "WA Campaign Finance (PDC)", agency: "WA Public Disclosure Commission", description: "Campaign contributions and expenditures", searchUrl: "https://www.pdc.wa.gov/browse/campaign-explorer", icon: "Vote" },
];

export const WA_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "King", label: "King County Assessor", url: "https://blue.kingcounty.com/Assessor/eRealProperty/default.aspx" },
  { county: "Pierce", label: "Pierce County Assessor", url: "https://www.piercecountywa.gov/assessortreasurer" },
  { county: "Snohomish", label: "Snohomish County Assessor", url: "https://snohomishcountywa.gov/1342/Property-Search" },
  { county: "Spokane", label: "Spokane County Assessor", url: "https://www.spokanecounty.org/assessor" },
  { county: "Clark", label: "Clark County Assessor", url: "https://www.clark.wa.gov/assessor" },
  { county: "Thurston", label: "Thurston County Assessor", url: "https://www.thurstoncountywa.gov/departments/assessor" },
  { county: "Kitsap", label: "Kitsap County Assessor", url: "https://www.kitsapgov.com/assessor/" },
  { county: "Whatcom", label: "Whatcom County Assessor", url: "https://www.whatcomcounty.us/assessor" },
];
