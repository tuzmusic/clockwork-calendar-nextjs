import dayjs from "dayjs";

import FullCalendarGig from "@/lib/models/FullCalendarGig";

export default class GigTitler {
  distanceInfo: NonNullable<ReturnType<typeof this.gig["getDistanceInfo"]>>;
  city: string;
  state: string;

  public makeTitle() {
    return [
      "🎹",
      this.getTimeFromHomeStr(),
      this.getLocationHintStr(),
      this.getHotelStr(),
      this.getDistanceStr()
    ].filter(Boolean)
      .join(" ");
  }

  private getDistanceStr() {
    return this.distanceInfo!.fromHome.miles + 'mi';
  }

  constructor(private gig: FullCalendarGig) {
    // todo: handle it not being fetched yet.
    this.distanceInfo = gig.getDistanceInfo()!;
    const [city, state] = this.getCityAndState(gig.getLocation());
    this.city = city;
    this.state = state;
  }

  private getCityAndState(fullAddress: string): [string, string] {
    // todo test this ont
    const regex = /\s*([^,]+),\s*([A-Z]{2})/;
    const match = fullAddress.match(regex);
    if (!match) {
      throw new Error("Invalid address format");
    }
    return [match[1], match[2]];
  }

  public getLocationHintStr() {
    if (this.city === "Boston" && this.state === "MA") {
      return GigTitler.abbreviations["Boston"] ?? this.state;
    }
    if (this.city === "Providence" && this.state === "RI") {
      return GigTitler.abbreviations["Providence"] ?? this.state;
    }
    if (this.state === "MA" && GigTitler.CapeCodCities.includes(this.city)) {
      return "CC";
    }
    return this.state;
  }

  public getTimeFromHomeStr() {
    return "🚙" + (() => {
      const { formattedTime, minutes } = this.distanceInfo["fromHome"];
      if (!formattedTime.includes("m")) {
        return formattedTime;
      }
      if (!formattedTime.includes("h")) {
        return formattedTime;
      }

      return dayjs.duration(minutes, "minutes").format("H:mm");
    })();
  }

  public getHotelStr() {
    if (this.distanceInfo["fromBoston"].minutes >= 120) {
      return "🏩";
    }
    return null;
  }

  static abbreviations = {
    "Boston": "BS",
    "Providence": "PR"
  };

  static CapeCodCities = [
    "Chatham",
    "Falmouth",
    "Mashpee",
    "Dennis",
    "Brewster",
    "Harwich",
    "Sandwich",
    "Sagamore Beach",
    "Barnstable",
    "Hyannis",
    "Orleans",
    "Provincetown"
  ];
}
