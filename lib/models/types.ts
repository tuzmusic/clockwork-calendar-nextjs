import { TIME_ZONE } from "@/lib/models/constants";

export interface TimeObj {
  dateTime: string;
  timeZone: typeof TIME_ZONE;
}

export const timeObj = (str: string) => (
  {
    dateTime: str,
    timeZone: TIME_ZONE
  } satisfies TimeObj
);

export interface DistanceData {
  minutes: number
  miles: number
  formattedTime: string
}

export type GigPartType = "reception" | "cocktail hour" | "ceremony"
