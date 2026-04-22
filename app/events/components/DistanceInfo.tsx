import { DistanceData } from "@/lib/models/types";

const distanceKeysTable = {
  fromHome: 'From Home',
  withWaltham: 'Total including Waltham St.',
  walthamDetour: 'Detour to Waltham St.',
  fromWaltham: 'Time from Waltham St.',
  fromBoston: '',
}

export function DistanceInfo({ info }: { info: Record<string, DistanceData> }) {
  const displayDistances = [
    'fromHome',
    'withWaltham',
    'walthamDetour',
    'fromWaltham'
  ] satisfies (keyof typeof distanceKeysTable)[]

  return (
    <div className="text-sm">
      <h4 className="underline">Distances</h4>
      <ul>
        {
          displayDistances.map((key) => (
            <li key={key} className="flex justify-between">
              <div>{distanceKeysTable[key]}</div>
              <div>{info[key].formattedTime}</div>
            </li>
          ))
        }
      </ul>

    </div>
  );
}
