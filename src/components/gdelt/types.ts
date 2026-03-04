export type QueryMode = "events" | "gkg" | "mentions";

export const GDELT_MAPPINGS = {
  quadClass: {
    1: "Verbal Cooperation",
    2: "Material Cooperation",
    3: "Verbal Conflict",
    4: "Material Conflict",
  } as Record<number, string>,
  eventCodes: {
    "01": "Public Statement",
    "02": "Appeal/Request",
    "03": "Intent to Cooperate",
    "04": "Consult/Visit",
    "05": "Praise/Endorse",
    "06": "Negotiate",
    "07": "Provide Aid",
    "08": "Yield/Concede",
    "09": "Investigate",
    "10": "Demand",
    "14": "Protest",
    "18": "Assault/Violence",
    "19": "Military Action",
  } as Record<string, string>,
};

export interface TopActor {
  name: string;
  count: number;
  avgTone: number;
  trend: "up" | "down";
}
