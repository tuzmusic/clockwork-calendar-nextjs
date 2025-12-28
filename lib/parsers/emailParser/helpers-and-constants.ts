export const userFirstName = "Jonathan";
export const EVENT_CELLS_MINIMUM = 5;

export function getTimesFromOtherPartText(text: string) {
  return text.match(/(\d{1,2}:\d{2})/g)!;
}
