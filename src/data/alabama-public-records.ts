import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const AL_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "al_sos_corps", name: "Business Entity Search", agency: "AL Secretary of State", description: "Corporations, LLCs, LPs, and trade names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://arc-sos.state.al.us/CGI/CORPNAME.MBR/INPUT?ESSION=${name}" },
  { id: "al_courts", name: "Court Case Search (Alacourt)", agency: "AL Administrative Office of Courts", description: "Civil, criminal, traffic, and domestic court records", searchUrl: "https://pa.alacourt.com/", icon: "Gavel" },
  { id: "al_doc", name: "Inmate Search", agency: "AL DOC", description: "Current inmates in Alabama state prisons", searchUrl: "http://www.doc.state.al.us/InmateSearch", icon: "ShieldAlert" },
  { id: "al_sex_offenders", name: "Sex Offender Registry", agency: "AL ALEA", description: "Registered sex offenders in Alabama", searchUrl: "https://community.alabamaleo.gov/", icon: "AlertTriangle" },
  { id: "al_voter", name: "Voter Registration", agency: "AL Secretary of State", description: "Voter registration status lookup", searchUrl: "https://myinfo.alabamavotes.gov/voterview", icon: "Vote" },
  { id: "al_ucc", name: "UCC Filings", agency: "AL Secretary of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://www.sos.alabama.gov/government-records/ucc", icon: "FileText" },
];

export const AL_LICENSE_SOURCES: RecordSource[] = [
  { id: "al_medical", name: "Medical License Verification", agency: "AL Board of Medical Examiners", description: "Physicians licensed in Alabama", searchUrl: "https://www.albme.org/look-up-a-doctor/", icon: "Stethoscope" },
  { id: "al_bar", name: "Attorney Search", agency: "AL State Bar", description: "Licensed attorneys in Alabama", searchUrl: "https://www.alabar.org/find-a-member/", icon: "Scale" },
];

export const AL_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "al_sos_cf", name: "AL Campaign Finance", agency: "AL Secretary of State", description: "Campaign contributions and expenditure reports", searchUrl: "https://fcpa.alabamavotes.gov/PublicSite/SearchPages/SearchByCommittee.aspx", icon: "Vote" },
];

export const AL_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Jefferson", label: "Jefferson County", url: "https://www.jccal.org/Default.asp?ID=82" },
  { county: "Madison", label: "Madison County", url: "https://www.madisoncountyal.gov/departments/tax-assessor" },
  { county: "Mobile", label: "Mobile County", url: "https://www.mobilecopropertytax.com/" },
  { county: "Montgomery", label: "Montgomery County", url: "https://www.mc-ala.org/revenue" },
  { county: "Shelby", label: "Shelby County", url: "https://www.shelbyal.com/197/Revenue-Commission" },
];
