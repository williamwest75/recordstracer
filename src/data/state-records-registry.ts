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
};

// Also match by state code
REGISTRY["fl"] = REGISTRY["florida"];
REGISTRY["ny"] = REGISTRY["new york"];
REGISTRY["ca"] = REGISTRY["california"];
REGISTRY["tx"] = REGISTRY["texas"];

export function getStateRecords(state: string): StateRecordSet | null {
  const key = state.toLowerCase().trim();
  return REGISTRY[key] || null;
}

export function getSupportedStates(): string[] {
  return ["Florida", "New York", "California", "Texas"];
}
