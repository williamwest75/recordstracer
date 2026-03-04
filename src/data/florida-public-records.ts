// Florida Public Records Deep-Link Directory for Record Tracer
// Source: florida_public_records_links.json v1.0 (2026-03-03)

export interface RecordSource {
  id: string;
  name: string;
  agency: string;
  description: string;
  searchUrl: string;
  icon: string; // lucide icon name
}

export interface CountyPropertySource {
  county: string;
  label: string;
  url: string;
}

// ── Professional License Search Portals ──
export const PROFESSIONAL_LICENSE_SOURCES: RecordSource[] = [
  {
    id: "dbpr",
    name: "Business & Professional Licenses",
    agency: "FL DBPR",
    description: "Contractors, real estate, accountants, architects, cosmetologists, engineers",
    searchUrl: "https://www.myfloridalicense.com/wl11.asp?mode=1&search=Name",
    icon: "Briefcase",
  },
  {
    id: "doh",
    name: "Medical & Health Licenses",
    agency: "FL Dept. of Health",
    description: "Doctors, nurses, dentists, pharmacists, paramedics, therapists",
    searchUrl: "https://mqa-internet.doh.state.fl.us/MQASearchServices/HealthCareProviders",
    icon: "Stethoscope",
  },
  {
    id: "florida_bar",
    name: "Attorney Search",
    agency: "The Florida Bar",
    description: "Lawyers licensed in Florida — search by name or bar number",
    searchUrl: "https://www.floridabar.org/directories/find-mbr/",
    icon: "Scale",
  },
  {
    id: "ofr",
    name: "Financial Licenses",
    agency: "FL Office of Financial Regulation",
    description: "Mortgage brokers, securities dealers, investment advisers",
    searchUrl: "https://flofr.gov/education/verify-a-license",
    icon: "DollarSign",
  },
];

// ── Statewide Record Sources ──
export const STATEWIDE_SOURCES: RecordSource[] = [
  {
    id: "sunbiz",
    name: "Business Entity Search",
    agency: "FL Division of Corporations",
    description: "Corporations, LLCs, partnerships, fictitious names",
    searchUrl: "https://dos.myflorida.com/sunbiz/search/",
    icon: "Building2",
  },
  {
    id: "court",
    name: "Court Records",
    agency: "FL Courts",
    description: "Statewide court case search",
    searchUrl: "https://www.flcourts.gov/",
    icon: "Gavel",
  },
  {
    id: "inmates",
    name: "Inmate / Offender Search",
    agency: "FL Dept. of Corrections",
    description: "Current and released inmates",
    searchUrl: "http://www.dc.state.fl.us/offenderSearch/",
    icon: "ShieldAlert",
  },
  {
    id: "sex_offenders",
    name: "Sex Offender Registry",
    agency: "FDLE",
    description: "Sex offender / predator search",
    searchUrl: "https://offender.fdle.state.fl.us/offender/sops/flyer.jsf",
    icon: "AlertTriangle",
  },
  {
    id: "voter",
    name: "Voter Registration Lookup",
    agency: "FL Division of Elections",
    description: "Voter registration status and history",
    searchUrl: "https://registration.elections.myflorida.com/en/CheckVoterStatus/Index",
    icon: "Vote",
  },
  {
    id: "ucc",
    name: "UCC Lien Search",
    agency: "FL Secured Transaction Registry",
    description: "Uniform Commercial Code lien filings",
    searchUrl: "https://www.floridaucc.com/uccweb/SearchDisclaimer.aspx",
    icon: "FileText",
  },
];

// ── County Property Appraiser Links ──
export const COUNTY_PROPERTY_SOURCES: CountyPropertySource[] = [
  { county: "Miami-Dade", label: "Miami-Dade Property Appraiser", url: "https://www.miamidade.gov/pa/property-search.asp" },
  { county: "Broward", label: "Broward County Property Appraiser", url: "https://web.bcpa.net/BcpaClient/" },
  { county: "Palm Beach", label: "Palm Beach County Property Appraiser", url: "https://www.pbcgov.org/papa/" },
  { county: "Orange", label: "Orange County Property Appraiser", url: "https://www.ocpafl.org/Searches/ParcelSearch.aspx" },
  { county: "Hillsborough", label: "Hillsborough County Property Appraiser", url: "https://gis.hcpafl.org/propertysearch/" },
  { county: "Pinellas", label: "Pinellas County Property Appraiser", url: "https://www.pcpao.gov/" },
  { county: "Duval", label: "Duval County (Jacksonville) Property Appraiser", url: "https://apps.coj.net/PAO_PropertySearch/" },
  { county: "Lee", label: "Lee County Property Appraiser", url: "https://www.leepa.org/Search/PropertySearch.aspx" },
  { county: "Volusia", label: "Volusia County Property Appraiser", url: "https://www.vcpa.org/" },
  { county: "Brevard", label: "Brevard County Property Appraiser", url: "https://www.bcpao.us/PropertySearch/" },
  { county: "Seminole", label: "Seminole County Property Appraiser", url: "https://www.scpafl.org/" },
  { county: "Polk", label: "Polk County Property Appraiser", url: "https://www.polkpa.org/" },
  { county: "Sarasota", label: "Sarasota County Property Appraiser", url: "https://www.sc-pa.com/" },
  { county: "Manatee", label: "Manatee County Property Appraiser", url: "https://www.manateepao.com/" },
  { county: "Osceola", label: "Osceola County Property Appraiser", url: "https://ira.property-appraiser.org/IRAsearch/" },
  { county: "Pasco", label: "Pasco County Property Appraiser", url: "https://www.pascopa.com/" },
  { county: "Collier", label: "Collier County Property Appraiser", url: "https://www.collierappraiser.com/" },
  { county: "Marion", label: "Marion County Property Appraiser", url: "https://www.pa.marion.fl.us/" },
  { county: "Alachua", label: "Alachua County Property Appraiser", url: "https://www.acpafl.org/" },
  { county: "Escambia", label: "Escambia County Property Appraiser", url: "https://www.escpa.org/" },
  { county: "Leon", label: "Leon County Property Appraiser", url: "https://www.leonpa.org/" },
  { county: "St. Johns", label: "St. Johns County Property Appraiser", url: "https://www.sjcpa.us/" },
  { county: "St. Lucie", label: "St. Lucie County Property Appraiser", url: "https://www.paslc.org/" },
  { county: "Clay", label: "Clay County Property Appraiser", url: "https://www.ccpao.com/" },
  { county: "Okaloosa", label: "Okaloosa County Property Appraiser", url: "https://www.okaloosapa.com/" },
  { county: "Lake", label: "Lake County Property Appraiser", url: "https://www.lakecopropappr.com/" },
];

// ── County Clerk of Court / Official Records ──
export const COUNTY_CLERK_SOURCES: CountyPropertySource[] = [
  { county: "Miami-Dade", label: "Miami-Dade Clerk Official Records", url: "https://www2.miami-dadeclerk.com/officialrecords/StandardSearch.aspx" },
  { county: "Broward", label: "Broward Clerk Official Records", url: "https://recordsearch.browardclerk.org/AcclaimWeb/search/SearchTypeDocType" },
  { county: "Palm Beach", label: "Palm Beach Clerk Official Records", url: "https://oris.co.palm-beach.fl.us/or_web1/new_sch.asp" },
  { county: "Orange", label: "Orange County Comptroller Official Records", url: "https://or.occompt.com/" },
  { county: "Hillsborough", label: "Hillsborough Clerk Official Records", url: "https://pubrec6.hillsclerk.com/ORIPublicAccess/" },
  { county: "Duval", label: "Duval County Clerk Official Records", url: "https://core.duvalclerk.com/CoreCms.aspx" },
];
