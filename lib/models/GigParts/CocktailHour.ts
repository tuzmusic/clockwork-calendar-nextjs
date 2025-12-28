import { GigPart } from "@/lib/models/GigParts/GigPart";

export class CocktailHour extends GigPart {
  constructor(startDateTime: string, endDateTime: string) {
    super("cocktail hour", startDateTime, endDateTime);
  }
}
