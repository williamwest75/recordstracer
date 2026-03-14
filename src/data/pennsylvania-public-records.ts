import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";

export const PA_STATEWIDE_SOURCES: RecordSource[] = [
  { id: "pa_dos_corps", name: "Business Entity Search", agency: "PA Dept. of State", description: "Corporations, LLCs, LPs, and fictitious names", searchUrl: "", icon: "Building2", deepLinkable: true, urlTemplate: "https://www.corporations.pa.gov/search/corpsearch?searchTerm=${name}" },
  { id: "pa_courts", name: "Court Case Search (UJS)", agency: "PA Unified Judicial System", description: "Civil, criminal, and appellate court records", searchUrl: "https://ujsportal.pacourts.us/CaseSearch", icon: "Gavel" },
  { id: "pa_doc", name: "Inmate Search", agency: "PA DOC", description: "Current inmates in Pennsylvania facilities", searchUrl: "https://inmatelocator.cor.pa.gov/#/", icon: "ShieldAlert" },
  { id: "pa_sex_offenders", name: "Sex Offender Registry (Megan's Law)", agency: "PA State Police", description: "Registered sex offenders in Pennsylvania", searchUrl: "https://www.meganslaw.state.pa.us/Search.aspx", icon: "AlertTriangle" },
  { id: "pa_voter", name: "Voter Registration", agency: "PA Dept. of State", description: "Voter registration status", searchUrl: "https://www.pavoterservices.pa.gov/pages/voterregistrationstatus.aspx", icon: "Vote" },
  { id: "pa_ucc", name: "UCC Filings", agency: "PA Dept. of State", description: "Uniform Commercial Code financing statements", searchUrl: "https://www.corporations.pa.gov/search/UCCSearch", icon: "FileText" },
];

export const PA_LICENSE_SOURCES: RecordSource[] = [
  { id: "pa_pals", name: "Professional License Lookup (PALS)", agency: "PA BPOA", description: "Doctors, nurses, real estate, contractors, and more", searchUrl: "https://www.pals.pa.gov/#/page/search", icon: "Briefcase" },
  { id: "pa_bar", name: "Attorney Search", agency: "PA Bar Association", description: "Licensed attorneys in Pennsylvania", searchUrl: "https://www.padisciplinaryboard.org/for-the-public/find-attorney", icon: "Scale" },
];

export const PA_CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  { id: "pa_dos_cf", name: "PA Campaign Finance", agency: "PA Dept. of State", description: "Campaign contributions and expenditures", searchUrl: "https://www.campaignfinanceonline.pa.gov/Pages/CFAnnualTotals.aspx", icon: "Vote" },
];

export const PA_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Philadelphia", label: "Philadelphia OPA", url: "https://property.phila.gov/" },
  { county: "Allegheny", label: "Allegheny County", url: "https://www2.alleghenycounty.us/RealEstate/Default.aspx" },
  { county: "Montgomery", label: "Montgomery County", url: "https://propertyrecords.montcopa.org/" },
  { county: "Bucks", label: "Bucks County", url: "https://www.buckscounty.gov/383/Board-of-Assessment" },
  { county: "Delaware", label: "Delaware County", url: "https://www.delcopa.gov/treasurer/realestatetax.html" },
  { county: "Chester", label: "Chester County", url: "https://www.chesco.org/224/Assessment-Office" },
  { county: "Lancaster", label: "Lancaster County", url: "https://www.co.lancaster.pa.us/168/Assessment" },
  { county: "Berks", label: "Berks County", url: "https://www.co.berks.pa.us/Dept/Assessment/Pages/default.aspx" },
];
