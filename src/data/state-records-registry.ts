// Central registry mapping states to their public record sources
import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";
import {
  PROFESSIONAL_LICENSE_SOURCES, CAMPAIGN_FINANCE_SOURCES, FEDERAL_RECORD_SOURCES,
  STATEWIDE_SOURCES, COUNTY_PROPERTY_SOURCES, COUNTY_CLERK_SOURCES,
} from "@/data/florida-public-records";
import { AL_STATEWIDE_SOURCES, AL_LICENSE_SOURCES, AL_CAMPAIGN_FINANCE_SOURCES, AL_PROPERTY_SOURCES } from "@/data/alabama-public-records";
import { AK_STATEWIDE_SOURCES, AK_LICENSE_SOURCES, AK_CAMPAIGN_FINANCE_SOURCES, AK_PROPERTY_SOURCES } from "@/data/alaska-public-records";
import { AZ_STATEWIDE_SOURCES, AZ_LICENSE_SOURCES, AZ_CAMPAIGN_FINANCE_SOURCES, AZ_PROPERTY_SOURCES } from "@/data/arizona-public-records";
import { AR_STATEWIDE_SOURCES, AR_LICENSE_SOURCES, AR_CAMPAIGN_FINANCE_SOURCES, AR_PROPERTY_SOURCES } from "@/data/arkansas-public-records";
import { CA_STATEWIDE_SOURCES, CA_LICENSE_SOURCES, CA_CAMPAIGN_FINANCE_SOURCES, CA_PROPERTY_SOURCES } from "@/data/california-public-records";
import { CO_STATEWIDE_SOURCES, CO_LICENSE_SOURCES, CO_CAMPAIGN_FINANCE_SOURCES, CO_PROPERTY_SOURCES } from "@/data/colorado-public-records";
import { CT_STATEWIDE_SOURCES, CT_LICENSE_SOURCES, CT_CAMPAIGN_FINANCE_SOURCES, CT_PROPERTY_SOURCES } from "@/data/connecticut-public-records";
import { DE_STATEWIDE_SOURCES, DE_LICENSE_SOURCES, DE_CAMPAIGN_FINANCE_SOURCES, DE_PROPERTY_SOURCES } from "@/data/delaware-public-records";
import { GA_STATEWIDE_SOURCES, GA_LICENSE_SOURCES, GA_CAMPAIGN_FINANCE_SOURCES, GA_PROPERTY_SOURCES } from "@/data/georgia-public-records";
import { HI_STATEWIDE_SOURCES, HI_LICENSE_SOURCES, HI_CAMPAIGN_FINANCE_SOURCES, HI_PROPERTY_SOURCES } from "@/data/hawaii-public-records";
import { ID_STATEWIDE_SOURCES, ID_LICENSE_SOURCES, ID_CAMPAIGN_FINANCE_SOURCES, ID_PROPERTY_SOURCES } from "@/data/idaho-public-records";
import { IL_STATEWIDE_SOURCES, IL_LICENSE_SOURCES, IL_CAMPAIGN_FINANCE_SOURCES, IL_PROPERTY_SOURCES } from "@/data/illinois-public-records";
import { IN_STATEWIDE_SOURCES, IN_LICENSE_SOURCES, IN_CAMPAIGN_FINANCE_SOURCES, IN_PROPERTY_SOURCES } from "@/data/indiana-public-records";
import { IA_STATEWIDE_SOURCES, IA_LICENSE_SOURCES, IA_CAMPAIGN_FINANCE_SOURCES, IA_PROPERTY_SOURCES } from "@/data/iowa-public-records";
import { KS_STATEWIDE_SOURCES, KS_LICENSE_SOURCES, KS_CAMPAIGN_FINANCE_SOURCES, KS_PROPERTY_SOURCES } from "@/data/kansas-public-records";
import { KY_STATEWIDE_SOURCES, KY_LICENSE_SOURCES, KY_CAMPAIGN_FINANCE_SOURCES, KY_PROPERTY_SOURCES } from "@/data/kentucky-public-records";
import { LA_STATEWIDE_SOURCES, LA_LICENSE_SOURCES, LA_CAMPAIGN_FINANCE_SOURCES, LA_PROPERTY_SOURCES } from "@/data/louisiana-public-records";
import { ME_STATEWIDE_SOURCES, ME_LICENSE_SOURCES, ME_CAMPAIGN_FINANCE_SOURCES, ME_PROPERTY_SOURCES } from "@/data/maine-public-records";
import { MD_STATEWIDE_SOURCES, MD_LICENSE_SOURCES, MD_CAMPAIGN_FINANCE_SOURCES, MD_PROPERTY_SOURCES } from "@/data/maryland-public-records";
import { MA_STATEWIDE_SOURCES, MA_LICENSE_SOURCES, MA_CAMPAIGN_FINANCE_SOURCES, MA_PROPERTY_SOURCES } from "@/data/massachusetts-public-records";
import { MI_STATEWIDE_SOURCES, MI_LICENSE_SOURCES, MI_CAMPAIGN_FINANCE_SOURCES, MI_PROPERTY_SOURCES } from "@/data/michigan-public-records";
import { MN_STATEWIDE_SOURCES, MN_LICENSE_SOURCES, MN_CAMPAIGN_FINANCE_SOURCES, MN_PROPERTY_SOURCES } from "@/data/minnesota-public-records";
import { MS_STATEWIDE_SOURCES, MS_LICENSE_SOURCES, MS_CAMPAIGN_FINANCE_SOURCES, MS_PROPERTY_SOURCES } from "@/data/mississippi-public-records";
import { MO_STATEWIDE_SOURCES, MO_LICENSE_SOURCES, MO_CAMPAIGN_FINANCE_SOURCES, MO_PROPERTY_SOURCES } from "@/data/missouri-public-records";
import { MT_STATEWIDE_SOURCES, MT_LICENSE_SOURCES, MT_CAMPAIGN_FINANCE_SOURCES, MT_PROPERTY_SOURCES } from "@/data/montana-public-records";
import { NE_STATEWIDE_SOURCES, NE_LICENSE_SOURCES, NE_CAMPAIGN_FINANCE_SOURCES, NE_PROPERTY_SOURCES } from "@/data/nebraska-public-records";
import { NV_STATEWIDE_SOURCES, NV_LICENSE_SOURCES, NV_CAMPAIGN_FINANCE_SOURCES, NV_PROPERTY_SOURCES } from "@/data/nevada-public-records";
import { NH_STATEWIDE_SOURCES, NH_LICENSE_SOURCES, NH_CAMPAIGN_FINANCE_SOURCES, NH_PROPERTY_SOURCES } from "@/data/new-hampshire-public-records";
import { NJ_STATEWIDE_SOURCES, NJ_LICENSE_SOURCES, NJ_CAMPAIGN_FINANCE_SOURCES, NJ_PROPERTY_SOURCES } from "@/data/new-jersey-public-records";
import { NM_STATEWIDE_SOURCES, NM_LICENSE_SOURCES, NM_CAMPAIGN_FINANCE_SOURCES, NM_PROPERTY_SOURCES } from "@/data/new-mexico-public-records";
import { NY_STATEWIDE_SOURCES, NY_LICENSE_SOURCES, NY_CAMPAIGN_FINANCE_SOURCES, NY_PROPERTY_SOURCES } from "@/data/new-york-public-records";
import { NC_STATEWIDE_SOURCES, NC_LICENSE_SOURCES, NC_CAMPAIGN_FINANCE_SOURCES, NC_PROPERTY_SOURCES } from "@/data/north-carolina-public-records";
import { ND_STATEWIDE_SOURCES, ND_LICENSE_SOURCES, ND_CAMPAIGN_FINANCE_SOURCES, ND_PROPERTY_SOURCES } from "@/data/north-dakota-public-records";
import { OH_STATEWIDE_SOURCES, OH_LICENSE_SOURCES, OH_CAMPAIGN_FINANCE_SOURCES, OH_PROPERTY_SOURCES } from "@/data/ohio-public-records";
import { OK_STATEWIDE_SOURCES, OK_LICENSE_SOURCES, OK_CAMPAIGN_FINANCE_SOURCES, OK_PROPERTY_SOURCES } from "@/data/oklahoma-public-records";
import { OR_STATEWIDE_SOURCES, OR_LICENSE_SOURCES, OR_CAMPAIGN_FINANCE_SOURCES, OR_PROPERTY_SOURCES } from "@/data/oregon-public-records";
import { PA_STATEWIDE_SOURCES, PA_LICENSE_SOURCES, PA_CAMPAIGN_FINANCE_SOURCES, PA_PROPERTY_SOURCES } from "@/data/pennsylvania-public-records";
import { RI_STATEWIDE_SOURCES, RI_LICENSE_SOURCES, RI_CAMPAIGN_FINANCE_SOURCES, RI_PROPERTY_SOURCES } from "@/data/rhode-island-public-records";
import { SC_STATEWIDE_SOURCES, SC_LICENSE_SOURCES, SC_CAMPAIGN_FINANCE_SOURCES, SC_PROPERTY_SOURCES } from "@/data/south-carolina-public-records";
import { SD_STATEWIDE_SOURCES, SD_LICENSE_SOURCES, SD_CAMPAIGN_FINANCE_SOURCES, SD_PROPERTY_SOURCES } from "@/data/south-dakota-public-records";
import { TN_STATEWIDE_SOURCES, TN_LICENSE_SOURCES, TN_CAMPAIGN_FINANCE_SOURCES, TN_PROPERTY_SOURCES } from "@/data/tennessee-public-records";
import { TX_STATEWIDE_SOURCES, TX_LICENSE_SOURCES, TX_CAMPAIGN_FINANCE_SOURCES, TX_PROPERTY_SOURCES } from "@/data/texas-public-records";
import { UT_STATEWIDE_SOURCES, UT_LICENSE_SOURCES, UT_CAMPAIGN_FINANCE_SOURCES, UT_PROPERTY_SOURCES } from "@/data/utah-public-records";
import { VT_STATEWIDE_SOURCES, VT_LICENSE_SOURCES, VT_CAMPAIGN_FINANCE_SOURCES, VT_PROPERTY_SOURCES } from "@/data/vermont-public-records";
import { VA_STATEWIDE_SOURCES, VA_LICENSE_SOURCES, VA_CAMPAIGN_FINANCE_SOURCES, VA_PROPERTY_SOURCES } from "@/data/virginia-public-records";
import { WA_STATEWIDE_SOURCES, WA_LICENSE_SOURCES, WA_CAMPAIGN_FINANCE_SOURCES, WA_PROPERTY_SOURCES } from "@/data/washington-public-records";
import { WV_STATEWIDE_SOURCES, WV_LICENSE_SOURCES, WV_CAMPAIGN_FINANCE_SOURCES, WV_PROPERTY_SOURCES } from "@/data/west-virginia-public-records";
import { WI_STATEWIDE_SOURCES, WI_LICENSE_SOURCES, WI_CAMPAIGN_FINANCE_SOURCES, WI_PROPERTY_SOURCES } from "@/data/wisconsin-public-records";
import { WY_STATEWIDE_SOURCES, WY_LICENSE_SOURCES, WY_CAMPAIGN_FINANCE_SOURCES, WY_PROPERTY_SOURCES } from "@/data/wyoming-public-records";

export interface StateRecordSet {
  stateName: string;
  stateCode: string;
  statewide: RecordSource[];
  licenses: RecordSource[];
  campaignFinance: RecordSource[];
  federal: RecordSource[];
  propertyCounties: CountyPropertySource[];
  clerkCounties: CountyPropertySource[];
}

function s(stateName: string, stateCode: string, statewide: RecordSource[], licenses: RecordSource[], campaignFinance: RecordSource[], propertyCounties: CountyPropertySource[], clerkCounties: CountyPropertySource[] = []): StateRecordSet {
  return { stateName, stateCode, statewide, licenses, campaignFinance, federal: FEDERAL_RECORD_SOURCES, propertyCounties, clerkCounties };
}

const REGISTRY: Record<string, StateRecordSet> = {
  alabama:          s("Alabama", "AL", AL_STATEWIDE_SOURCES, AL_LICENSE_SOURCES, AL_CAMPAIGN_FINANCE_SOURCES, AL_PROPERTY_SOURCES),
  alaska:           s("Alaska", "AK", AK_STATEWIDE_SOURCES, AK_LICENSE_SOURCES, AK_CAMPAIGN_FINANCE_SOURCES, AK_PROPERTY_SOURCES),
  arizona:          s("Arizona", "AZ", AZ_STATEWIDE_SOURCES, AZ_LICENSE_SOURCES, AZ_CAMPAIGN_FINANCE_SOURCES, AZ_PROPERTY_SOURCES),
  arkansas:         s("Arkansas", "AR", AR_STATEWIDE_SOURCES, AR_LICENSE_SOURCES, AR_CAMPAIGN_FINANCE_SOURCES, AR_PROPERTY_SOURCES),
  california:       s("California", "CA", CA_STATEWIDE_SOURCES, CA_LICENSE_SOURCES, CA_CAMPAIGN_FINANCE_SOURCES, CA_PROPERTY_SOURCES),
  colorado:         s("Colorado", "CO", CO_STATEWIDE_SOURCES, CO_LICENSE_SOURCES, CO_CAMPAIGN_FINANCE_SOURCES, CO_PROPERTY_SOURCES),
  connecticut:      s("Connecticut", "CT", CT_STATEWIDE_SOURCES, CT_LICENSE_SOURCES, CT_CAMPAIGN_FINANCE_SOURCES, CT_PROPERTY_SOURCES),
  delaware:         s("Delaware", "DE", DE_STATEWIDE_SOURCES, DE_LICENSE_SOURCES, DE_CAMPAIGN_FINANCE_SOURCES, DE_PROPERTY_SOURCES),
  florida:          { stateName: "Florida", stateCode: "FL", statewide: STATEWIDE_SOURCES, licenses: PROFESSIONAL_LICENSE_SOURCES, campaignFinance: CAMPAIGN_FINANCE_SOURCES, federal: FEDERAL_RECORD_SOURCES, propertyCounties: COUNTY_PROPERTY_SOURCES, clerkCounties: COUNTY_CLERK_SOURCES },
  georgia:          s("Georgia", "GA", GA_STATEWIDE_SOURCES, GA_LICENSE_SOURCES, GA_CAMPAIGN_FINANCE_SOURCES, GA_PROPERTY_SOURCES),
  hawaii:           s("Hawaii", "HI", HI_STATEWIDE_SOURCES, HI_LICENSE_SOURCES, HI_CAMPAIGN_FINANCE_SOURCES, HI_PROPERTY_SOURCES),
  idaho:            s("Idaho", "ID", ID_STATEWIDE_SOURCES, ID_LICENSE_SOURCES, ID_CAMPAIGN_FINANCE_SOURCES, ID_PROPERTY_SOURCES),
  illinois:         s("Illinois", "IL", IL_STATEWIDE_SOURCES, IL_LICENSE_SOURCES, IL_CAMPAIGN_FINANCE_SOURCES, IL_PROPERTY_SOURCES),
  indiana:          s("Indiana", "IN", IN_STATEWIDE_SOURCES, IN_LICENSE_SOURCES, IN_CAMPAIGN_FINANCE_SOURCES, IN_PROPERTY_SOURCES),
  iowa:             s("Iowa", "IA", IA_STATEWIDE_SOURCES, IA_LICENSE_SOURCES, IA_CAMPAIGN_FINANCE_SOURCES, IA_PROPERTY_SOURCES),
  kansas:           s("Kansas", "KS", KS_STATEWIDE_SOURCES, KS_LICENSE_SOURCES, KS_CAMPAIGN_FINANCE_SOURCES, KS_PROPERTY_SOURCES),
  kentucky:         s("Kentucky", "KY", KY_STATEWIDE_SOURCES, KY_LICENSE_SOURCES, KY_CAMPAIGN_FINANCE_SOURCES, KY_PROPERTY_SOURCES),
  louisiana:        s("Louisiana", "LA", LA_STATEWIDE_SOURCES, LA_LICENSE_SOURCES, LA_CAMPAIGN_FINANCE_SOURCES, LA_PROPERTY_SOURCES),
  maine:            s("Maine", "ME", ME_STATEWIDE_SOURCES, ME_LICENSE_SOURCES, ME_CAMPAIGN_FINANCE_SOURCES, ME_PROPERTY_SOURCES),
  maryland:         s("Maryland", "MD", MD_STATEWIDE_SOURCES, MD_LICENSE_SOURCES, MD_CAMPAIGN_FINANCE_SOURCES, MD_PROPERTY_SOURCES),
  massachusetts:    s("Massachusetts", "MA", MA_STATEWIDE_SOURCES, MA_LICENSE_SOURCES, MA_CAMPAIGN_FINANCE_SOURCES, MA_PROPERTY_SOURCES),
  michigan:         s("Michigan", "MI", MI_STATEWIDE_SOURCES, MI_LICENSE_SOURCES, MI_CAMPAIGN_FINANCE_SOURCES, MI_PROPERTY_SOURCES),
  minnesota:        s("Minnesota", "MN", MN_STATEWIDE_SOURCES, MN_LICENSE_SOURCES, MN_CAMPAIGN_FINANCE_SOURCES, MN_PROPERTY_SOURCES),
  mississippi:      s("Mississippi", "MS", MS_STATEWIDE_SOURCES, MS_LICENSE_SOURCES, MS_CAMPAIGN_FINANCE_SOURCES, MS_PROPERTY_SOURCES),
  missouri:         s("Missouri", "MO", MO_STATEWIDE_SOURCES, MO_LICENSE_SOURCES, MO_CAMPAIGN_FINANCE_SOURCES, MO_PROPERTY_SOURCES),
  montana:          s("Montana", "MT", MT_STATEWIDE_SOURCES, MT_LICENSE_SOURCES, MT_CAMPAIGN_FINANCE_SOURCES, MT_PROPERTY_SOURCES),
  nebraska:         s("Nebraska", "NE", NE_STATEWIDE_SOURCES, NE_LICENSE_SOURCES, NE_CAMPAIGN_FINANCE_SOURCES, NE_PROPERTY_SOURCES),
  nevada:           s("Nevada", "NV", NV_STATEWIDE_SOURCES, NV_LICENSE_SOURCES, NV_CAMPAIGN_FINANCE_SOURCES, NV_PROPERTY_SOURCES),
  "new hampshire":  s("New Hampshire", "NH", NH_STATEWIDE_SOURCES, NH_LICENSE_SOURCES, NH_CAMPAIGN_FINANCE_SOURCES, NH_PROPERTY_SOURCES),
  "new jersey":     s("New Jersey", "NJ", NJ_STATEWIDE_SOURCES, NJ_LICENSE_SOURCES, NJ_CAMPAIGN_FINANCE_SOURCES, NJ_PROPERTY_SOURCES),
  "new mexico":     s("New Mexico", "NM", NM_STATEWIDE_SOURCES, NM_LICENSE_SOURCES, NM_CAMPAIGN_FINANCE_SOURCES, NM_PROPERTY_SOURCES),
  "new york":       s("New York", "NY", NY_STATEWIDE_SOURCES, NY_LICENSE_SOURCES, NY_CAMPAIGN_FINANCE_SOURCES, NY_PROPERTY_SOURCES),
  "north carolina": s("North Carolina", "NC", NC_STATEWIDE_SOURCES, NC_LICENSE_SOURCES, NC_CAMPAIGN_FINANCE_SOURCES, NC_PROPERTY_SOURCES),
  "north dakota":   s("North Dakota", "ND", ND_STATEWIDE_SOURCES, ND_LICENSE_SOURCES, ND_CAMPAIGN_FINANCE_SOURCES, ND_PROPERTY_SOURCES),
  ohio:             s("Ohio", "OH", OH_STATEWIDE_SOURCES, OH_LICENSE_SOURCES, OH_CAMPAIGN_FINANCE_SOURCES, OH_PROPERTY_SOURCES),
  oklahoma:         s("Oklahoma", "OK", OK_STATEWIDE_SOURCES, OK_LICENSE_SOURCES, OK_CAMPAIGN_FINANCE_SOURCES, OK_PROPERTY_SOURCES),
  oregon:           s("Oregon", "OR", OR_STATEWIDE_SOURCES, OR_LICENSE_SOURCES, OR_CAMPAIGN_FINANCE_SOURCES, OR_PROPERTY_SOURCES),
  pennsylvania:     s("Pennsylvania", "PA", PA_STATEWIDE_SOURCES, PA_LICENSE_SOURCES, PA_CAMPAIGN_FINANCE_SOURCES, PA_PROPERTY_SOURCES),
  "rhode island":   s("Rhode Island", "RI", RI_STATEWIDE_SOURCES, RI_LICENSE_SOURCES, RI_CAMPAIGN_FINANCE_SOURCES, RI_PROPERTY_SOURCES),
  "south carolina": s("South Carolina", "SC", SC_STATEWIDE_SOURCES, SC_LICENSE_SOURCES, SC_CAMPAIGN_FINANCE_SOURCES, SC_PROPERTY_SOURCES),
  "south dakota":   s("South Dakota", "SD", SD_STATEWIDE_SOURCES, SD_LICENSE_SOURCES, SD_CAMPAIGN_FINANCE_SOURCES, SD_PROPERTY_SOURCES),
  tennessee:        s("Tennessee", "TN", TN_STATEWIDE_SOURCES, TN_LICENSE_SOURCES, TN_CAMPAIGN_FINANCE_SOURCES, TN_PROPERTY_SOURCES),
  texas:            s("Texas", "TX", TX_STATEWIDE_SOURCES, TX_LICENSE_SOURCES, TX_CAMPAIGN_FINANCE_SOURCES, TX_PROPERTY_SOURCES),
  utah:             s("Utah", "UT", UT_STATEWIDE_SOURCES, UT_LICENSE_SOURCES, UT_CAMPAIGN_FINANCE_SOURCES, UT_PROPERTY_SOURCES),
  vermont:          s("Vermont", "VT", VT_STATEWIDE_SOURCES, VT_LICENSE_SOURCES, VT_CAMPAIGN_FINANCE_SOURCES, VT_PROPERTY_SOURCES),
  virginia:         s("Virginia", "VA", VA_STATEWIDE_SOURCES, VA_LICENSE_SOURCES, VA_CAMPAIGN_FINANCE_SOURCES, VA_PROPERTY_SOURCES),
  washington:       s("Washington", "WA", WA_STATEWIDE_SOURCES, WA_LICENSE_SOURCES, WA_CAMPAIGN_FINANCE_SOURCES, WA_PROPERTY_SOURCES),
  "west virginia":  s("West Virginia", "WV", WV_STATEWIDE_SOURCES, WV_LICENSE_SOURCES, WV_CAMPAIGN_FINANCE_SOURCES, WV_PROPERTY_SOURCES),
  wisconsin:        s("Wisconsin", "WI", WI_STATEWIDE_SOURCES, WI_LICENSE_SOURCES, WI_CAMPAIGN_FINANCE_SOURCES, WI_PROPERTY_SOURCES),
  wyoming:          s("Wyoming", "WY", WY_STATEWIDE_SOURCES, WY_LICENSE_SOURCES, WY_CAMPAIGN_FINANCE_SOURCES, WY_PROPERTY_SOURCES),
};

// Also match by state code (lowercase)
const CODE_MAP: Record<string, string> = {
  al: "alabama", ak: "alaska", az: "arizona", ar: "arkansas", ca: "california",
  co: "colorado", ct: "connecticut", de: "delaware", fl: "florida", ga: "georgia",
  hi: "hawaii", id: "idaho", il: "illinois", in: "indiana", ia: "iowa",
  ks: "kansas", ky: "kentucky", la: "louisiana", me: "maine", md: "maryland",
  ma: "massachusetts", mi: "michigan", mn: "minnesota", ms: "mississippi", mo: "missouri",
  mt: "montana", ne: "nebraska", nv: "nevada", nh: "new hampshire", nj: "new jersey",
  nm: "new mexico", ny: "new york", nc: "north carolina", nd: "north dakota", oh: "ohio",
  ok: "oklahoma", or: "oregon", pa: "pennsylvania", ri: "rhode island", sc: "south carolina",
  sd: "south dakota", tn: "tennessee", tx: "texas", ut: "utah", vt: "vermont",
  va: "virginia", wa: "washington", wv: "west virginia", wi: "wisconsin", wy: "wyoming",
};

for (const [code, name] of Object.entries(CODE_MAP)) {
  REGISTRY[code] = REGISTRY[name];
}

export function getStateRecords(state: string): StateRecordSet | null {
  const key = state.toLowerCase().trim();
  return REGISTRY[key] || null;
}

export function getAllStateRecords(): StateRecordSet[] {
  return getSupportedStates().map(name => REGISTRY[name.toLowerCase()]).filter(Boolean);
}

export function getSupportedStates(): string[] {
  return [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California",
    "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
    "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  ];
}
