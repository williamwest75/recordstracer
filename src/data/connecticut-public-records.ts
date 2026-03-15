import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const CT_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "ct_sos_corps", name: "Business Entity Search", agency: "CT Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://service.ct.gov/business/s/onlinebusinesssearch?businessNameEn=${name}" },
  { id: "ct_courts", name: "Court Case Search", agency: "CT Judicial Branch", description: "Civil, criminal, family, and housing court records", searchUrl: "https://www.jud.ct.gov/jud2.htm", icon: "Gavel" },
  { id: "ct_doc", name: "Inmate Search", agency: "CT DOC", description: "Current inmates in Connecticut facilities", searchUrl: "http://www.ctinmateinfo.state.ct.us/", icon: "ShieldAlert" },
  { id: "ct_sex_offenders", name: "Sex Offender Registry", agency: "CT DESPP", description: "Registered sex offenders in Connecticut", searchUrl: "https://www.communitynotification.com/cap_office_disclaimer.php?office=54567", icon: "AlertTriangle" },
  { id: "ct_voter", name: "Voter Registration", agency: "CT Secretary of State", description: "Voter registration status", searchUrl: "https://portaldir.ct.gov/sots/LookUp.aspx", icon: "Vote" },
  { id: "ct_ucc", name: "UCC Filings", agency: "CT Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://www.concord-sots.ct.gov/CONCORD/online?sn=PublicInquiry&eid=9730", icon: "FileText" },
];

export const CT_LICENSE_SOURCES: RecordSource[] = [
  { id: "ct_dcp", name: "Professional License Lookup", agency: "CT DCP", description: "Various professional and occupational licenses", searchUrl: "https://www.elicense.ct.gov/Lookup/LicenseLookup.aspx", icon: "Briefcase" },
  { id: "ct_bar", name: "Attorney Search", agency: "CT Judicial Branch", description: "Licensed attorneys in Connecticut", searchUrl: "https://www.jud.ct.gov/attorneyfirminquiry/AttorneyFirmInquiry.aspx", icon: "Scale" },
];

export const CT_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "ct_seec", name: "CT Campaign Finance", agency: "CT SEEC", description: "Campaign contributions and expenditures", searchUrl: "https://seec.ct.gov/Portal/eCRIS/eCRISsearch/", icon: "Vote" },
];

export const CT_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Hartford", label: "City of Hartford", url: "https://www.hartfordct.gov/Government/City-Departments/Assessor" },
  { county: "New Haven", label: "City of New Haven", url: "https://www.newhavenct.gov/assessors-office" },
  { county: "Fairfield (Bridgeport)", label: "City of Bridgeport", url: "https://www.bridgeportct.gov/departments/assessors-office" },
  { county: "Fairfield (Stamford)", label: "City of Stamford", url: "https://www.stamfordct.gov/assessor" },
];
