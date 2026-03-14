import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const MT_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "mt_sos_corps", name: "Business Entity Search", agency: "MT Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://biz.sosmt.gov/search?SearchTerm=${name}" },
  { id: "mt_courts", name: "Court Case Search", agency: "MT Judicial Branch", description: "District court case records", searchUrl: "https://courts.mt.gov/external-resources/case-search", icon: "Gavel" },
  { id: "mt_doc", name: "Offender Search", agency: "MT DOC", description: "Current inmates in Montana facilities", searchUrl: "https://app.mt.gov/conweb/", icon: "ShieldAlert" },
  { id: "mt_sex_offenders", name: "Sex Offender Registry", agency: "MT DOJ", description: "Registered sex offenders in Montana", searchUrl: "https://app.doj.mt.gov/svor/", icon: "AlertTriangle" },
  { id: "mt_voter", name: "Voter Registration", agency: "MT Secretary of State", description: "Voter registration status", searchUrl: "https://prodvoterportal.mt.gov/WhereToVote.aspx", icon: "Vote" },
  { id: "mt_ucc", name: "UCC Filings", agency: "MT Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://biz.sosmt.gov/search/ucc", icon: "FileText" },
];

export const MT_LICENSE_SOURCES: RecordSource[] = [
  { id: "mt_license", name: "Professional License Lookup", agency: "MT Business Standards Division", description: "Various professional licenses", searchUrl: "https://ebiz.mt.gov/POL/", icon: "Briefcase" },
  { id: "mt_bar", name: "Attorney Search", agency: "State Bar of Montana", description: "Licensed attorneys in Montana", searchUrl: "https://www.montanabar.org/page/FindaLawyer", icon: "Scale" },
];

export const MT_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "mt_copp_cf", name: "MT Campaign Finance", agency: "MT COPP", description: "Campaign finance reports", searchUrl: "https://camptrackr.mt.gov/", icon: "Vote" },
];

export const MT_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Yellowstone", label: "Yellowstone County", url: "https://www.co.yellowstone.mt.gov/assessor/" },
  { county: "Missoula", label: "Missoula County", url: "https://www.missoulacounty.us/government/financial-services/department-of-revenue" },
  { county: "Gallatin", label: "Gallatin County", url: "https://gallatincomt.virtualtownhall.net/assessor" },
  { county: "Flathead", label: "Flathead County", url: "https://www.flathead.mt.gov/dor/" },
];
