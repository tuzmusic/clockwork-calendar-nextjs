import { LOCATIONS } from "~/data/models/constants";
import DistanceService from "~/data/services/DistanceService";

type GetDistanceInfoArgs = Parameters<InstanceType<typeof DistanceService>["getDistanceInfo"]>[0];
export const conditions = (location: string) => ( {
  timeFromHome: (p) => {
    return p.from.includes(LOCATIONS.home)
      && !p.through
      && p.to === location;
  },
  timeWithWaltham: (p) => {
    return p.from.includes(LOCATIONS.home)
      && p.through === LOCATIONS.waltham
      && p.to === location;
  },
  timeFromWaltham: (p) => {
    return p.from.includes(LOCATIONS.waltham)
      && p.to === location;
  },
  timeForWalthamDetour: () => {
    return true;
  },
  milesFromBoston: (p) => {
    return p.from === LOCATIONS.boston && p.to === location;
  }
} satisfies Record<
  string,
  (args: GetDistanceInfoArgs) => boolean
>);
