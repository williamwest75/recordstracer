// Central registry mapping states to their public record sources
import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";
import {
  PROFESSIONAL_LICENSE_SOURCES,
  CAMPAIGN_FINANCE_SOURCES,
  FEDERAL_RECORD_SOURCES,
  STATEWIDE_SOURCES,
  COUNTY_PROPERTY_SOURCES,
  COUNTY_CLERK_SOURCES,
} from "@/data/florida-public-records";
import { NY_STATEWIDE_SOURCES, NY_LICENSE_SOURCES, NY_CAMPAIGN_FINANCE_SOURCES, NY_PROPERTY_SOURCES } from "@/data/new-york-public-records";
import { CA_STATEWIDE_SOURCES, CA_LICENSE_SOURCES, CA_CAMPAIGN_FINANCE_SOURCES, CA_PROPERTY_SOURCES } from "@/data/california-public-records";
import { TX_STATEWIDE_SOURCES, TX_LICENSE_SOURCES, TX_CAMPAIGN_FINANCE_SOURCES, TX_PROPERTY_SOURCES } from "@/data/texas-public-records";
import { NC_STATEWIDE_SOURCES, NC_LICENSE_SOURCES, NC_CAMPAIGN_FINANCE_SOURCES, NC_PROPERTY_SOURCES } from "@/data/north-carolina-public-records";
import { OH_STATEWIDE_SOURCES, OH_LICENSE_SOURCES, OH_CAMPAIGN_FINANCE_SOURCES, OH_PROPERTY_SOURCES } from "@/data/ohio-public-records";
import { MI_STATEWIDE_SOURCES, MI_LICENSE_SOURCES, MI_CAMPAIGN_FINANCE_SOURCES, MI_PROPERTY_SOURCES } from "@/data/michigan-public-records";
import { KY_STATEWIDE_SOURCES, KY_LICENSE_SOURCES, KY_CAMPAIGN_FINANCE_SOURCES, KY_PROPERTY_SOURCES } from "@/data/kentucky-public-records";
import { WI_STATEWIDE_SOURCES, WI_LICENSE_SOURCES, WI_CAMPAIGN_FINANCE_SOURCES, WI_PROPERTY_SOURCES } from "@/data/wisconsin-public-records";
import { MO_STATEWIDE_SOURCES, MO_LICENSE_SOURCES, MO_CAMPAIGN_FINANCE_SOURCES, MO_PROPERTY_SOURCES } from "@/data/missouri-public-records";
import { MA_STATEWIDE_SOURCES, MA_LICENSE_SOURCES, MA_CAMPAIGN_FINANCE_SOURCES, MA_PROPERTY_SOURCES } from "@/data/massachusetts-public-records";
import { ME_STATEWIDE_SOURCES, ME_LICENSE_SOURCES, ME_CAMPAIGN_FINANCE_SOURCES, ME_PROPERTY_SOURCES } from "@/data/maine-public-records";
import { NH_STATEWIDE_SOURCES, NH_LICENSE_SOURCES, NH_CAMPAIGN_FINANCE_SOURCES, NH_PROPERTY_SOURCES } from "@/data/new-hampshire-public-records";
import { VT_STATEWIDE_SOURCES, VT_LICENSE_SOURCES, VT_CAMPAIGN_FINANCE_SOURCES, VT_PROPERTY_SOURCES } from "@/data/vermont-public-records";

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

const REGISTRY: Record<string, StateRecordSet> = {
  florida: {
    stateName: "Florida",
    stateCode: "FL",
    statewide: STATEWIDE_SOURCES,
    licenses: PROFESSIONAL_LICENSE_SOURCES,
    campaignFinance: CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: COUNTY_PROPERTY_SOURCES,
    clerkCounties: COUNTY_CLERK_SOURCES,
  },
  "new york": {
    stateName: "New York",
    stateCode: "NY",
    statewide: NY_STATEWIDE_SOURCES,
    licenses: NY_LICENSE_SOURCES,
    campaignFinance: NY_CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: NY_PROPERTY_SOURCES,
    clerkCounties: [],
  },
  california: {
    stateName: "California",
    stateCode: "CA",
    statewide: CA_STATEWIDE_SOURCES,
    licenses: CA_LICENSE_SOURCES,
    campaignFinance: CA_CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: CA_PROPERTY_SOURCES,
    clerkCounties: [],
  },
  texas: {
    stateName: "Texas",
    stateCode: "TX",
    statewide: TX_STATEWIDE_SOURCES,
    licenses: TX_LICENSE_SOURCES,
    campaignFinance: TX_CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: TX_PROPERTY_SOURCES,
    clerkCounties: [],
  },
  "north carolina": {
    stateName: "North Carolina",
    stateCode: "NC",
    statewide: NC_STATEWIDE_SOURCES,
    licenses: NC_LICENSE_SOURCES,
    campaignFinance: NC_CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: NC_PROPERTY_SOURCES,
    clerkCounties: [],
  },
  ohio: {
    stateName: "Ohio",
    stateCode: "OH",
    statewide: OH_STATEWIDE_SOURCES,
    licenses: OH_LICENSE_SOURCES,
    campaignFinance: OH_CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: OH_PROPERTY_SOURCES,
    clerkCounties: [],
  },
  michigan: {
    stateName: "Michigan",
    stateCode: "MI",
    statewide: MI_STATEWIDE_SOURCES,
    licenses: MI_LICENSE_SOURCES,
    campaignFinance: MI_CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: MI_PROPERTY_SOURCES,
    clerkCounties: [],
  },
  kentucky: {
    stateName: "Kentucky",
    stateCode: "KY",
    statewide: KY_STATEWIDE_SOURCES,
    licenses: KY_LICENSE_SOURCES,
    campaignFinance: KY_CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: KY_PROPERTY_SOURCES,
    clerkCounties: [],
  },
  wisconsin: {
    stateName: "Wisconsin",
    stateCode: "WI",
    statewide: WI_STATEWIDE_SOURCES,
    licenses: WI_LICENSE_SOURCES,
    campaignFinance: WI_CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: WI_PROPERTY_SOURCES,
    clerkCounties: [],
  },
  missouri: {
    stateName: "Missouri",
    stateCode: "MO",
    statewide: MO_STATEWIDE_SOURCES,
    licenses: MO_LICENSE_SOURCES,
    campaignFinance: MO_CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: MO_PROPERTY_SOURCES,
    clerkCounties: [],
  },
  massachusetts: {
    stateName: "Massachusetts",
    stateCode: "MA",
    statewide: MA_STATEWIDE_SOURCES,
    licenses: MA_LICENSE_SOURCES,
    campaignFinance: MA_CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: MA_PROPERTY_SOURCES,
    clerkCounties: [],
  },
  maine: {
    stateName: "Maine",
    stateCode: "ME",
    statewide: ME_STATEWIDE_SOURCES,
    licenses: ME_LICENSE_SOURCES,
    campaignFinance: ME_CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: ME_PROPERTY_SOURCES,
    clerkCounties: [],
  },
  "new hampshire": {
    stateName: "New Hampshire",
    stateCode: "NH",
    statewide: NH_STATEWIDE_SOURCES,
    licenses: NH_LICENSE_SOURCES,
    campaignFinance: NH_CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: NH_PROPERTY_SOURCES,
    clerkCounties: [],
  },
  vermont: {
    stateName: "Vermont",
    stateCode: "VT",
    statewide: VT_STATEWIDE_SOURCES,
    licenses: VT_LICENSE_SOURCES,
    campaignFinance: VT_CAMPAIGN_FINANCE_SOURCES,
    federal: FEDERAL_RECORD_SOURCES,
    propertyCounties: VT_PROPERTY_SOURCES,
    clerkCounties: [],
  },
};

// Also match by state code
REGISTRY["fl"] = REGISTRY["florida"];
REGISTRY["ny"] = REGISTRY["new york"];
REGISTRY["ca"] = REGISTRY["california"];
REGISTRY["tx"] = REGISTRY["texas"];
REGISTRY["nc"] = REGISTRY["north carolina"];
REGISTRY["oh"] = REGISTRY["ohio"];
REGISTRY["mi"] = REGISTRY["michigan"];
REGISTRY["ky"] = REGISTRY["kentucky"];
REGISTRY["wi"] = REGISTRY["wisconsin"];
REGISTRY["mo"] = REGISTRY["missouri"];
REGISTRY["ma"] = REGISTRY["massachusetts"];
REGISTRY["me"] = REGISTRY["maine"];
REGISTRY["nh"] = REGISTRY["new hampshire"];
REGISTRY["vt"] = REGISTRY["vermont"];

export function getStateRecords(state: string): StateRecordSet | null {
  const key = state.toLowerCase().trim();
  return REGISTRY[key] || null;
}

export function getSupportedStates(): string[] {
  return [
    "California", "Florida", "Kentucky", "Maine", "Massachusetts",
    "Michigan", "Missouri", "New Hampshire", "New York", "North Carolina",
    "Ohio", "Texas", "Vermont", "Wisconsin",
  ];
}
