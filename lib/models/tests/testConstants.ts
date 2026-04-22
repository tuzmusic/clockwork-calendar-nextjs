import { FullDistanceInfoObj } from "~/data/models/FullCalendarGig";
import { CocktailHour } from "~/data/models/GigParts/CocktailHour";
import { GigPartJSON } from "~/data/models/GigParts/GigPart";
import { Reception } from "~/data/models/GigParts/Reception";

export const location = "123 Sesame St, Concord, NH";

export const start = "2024-12-01T19:00:00";

export const end = "2024-12-01T23:00:00";

export const mockDistanceData = {
  fromHome: { miles: 1, minutes: 10, formattedTime: "10m" },
  withWaltham: { miles: 2, minutes: 20, formattedTime: "20m" },
  walthamDetour: { miles: 3, minutes: 30, formattedTime: "30m" },
  fromWaltham: { miles: 4, minutes: 40, formattedTime: "40m" },
  fromBoston: { miles: 5, minutes: 50, formattedTime: "0m" }
} satisfies FullDistanceInfoObj;

export const receptionStart = "2024-12-01T19:00:00";
export const cocktailEnd = receptionStart
export const cocktailStart = "2024-12-01T18:00:00";
export const receptionEnd = "2024-12-01T21:00:00";
export const receptionPart = new Reception(receptionStart, receptionEnd);
export const cocktailHourPart = new CocktailHour(cocktailStart, cocktailEnd);
export const cocktailHourPartJSON = {
  type: "cocktail hour",
  startDateTime: cocktailStart,
  endDateTime: cocktailEnd,
  actualStartDateTime: cocktailStart,
  actualEndDateTime: cocktailEnd
} satisfies GigPartJSON;

export const mockReceptionJSON = {
  type: "reception",
  startDateTime: start,
  endDateTime: end,
  actualStartDateTime: start,
  actualEndDateTime: end
} satisfies GigPartJSON;

export const mockReceptionPart = new Reception(
  mockReceptionJSON.startDateTime,
  mockReceptionJSON.endDateTime
);

export const mockParts = [
  mockReceptionJSON
] satisfies GigPartJSON[];

export const mockReceptionJSONWithActual = {
  ...mockReceptionJSON,
  actualStartDateTime: start,
  actualEndDateTime: end
} satisfies Required<GigPartJSON>;
