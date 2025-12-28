'use client'

interface EventRowUIProps {
  eventRow: any
  onSave: (id: string, gigData: any) => void
  onUpdate: (id: string, gigData: any) => void
  isLoading: boolean
}

export default function EventRowUI({
  eventRow,
  onSave,
  onUpdate,
  isLoading,
}: EventRowUIProps) {
  const { emailGig, googleGig, appGig, hasChanged, hasUpdates } = eventRow
  const gigId = emailGig?.id || googleGig?.id

  return (
    <div className="border rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Gig */}
        <div className="border-r pr-4">
          <h3 className="font-bold text-lg mb-2">Email</h3>
          {emailGig ? (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Location:</span> {emailGig.location}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Start:</span>{' '}
                {new Date(emailGig.startDateTime).toLocaleString()}
              </p>
              <p className="text-sm">
                <span className="font-semibold">End:</span>{' '}
                {new Date(emailGig.endDateTime).toLocaleString()}
              </p>
              {emailGig.parts && (
                <div className="text-sm">
                  <span className="font-semibold">Parts:</span>
                  <ul className="list-disc list-inside ml-2">
                    {JSON.parse(emailGig.parts).map((part: any, i: number) => (
                      <li key={i}>{part.type}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No email data</p>
          )}
        </div>

        {/* Google Calendar Gig */}
        <div className="pl-4">
          <h3 className="font-bold text-lg mb-2">Calendar</h3>
          {googleGig ? (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Location:</span> {googleGig.location}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Start:</span>{' '}
                {new Date(googleGig.startDateTime).toLocaleString()}
              </p>
              <p className="text-sm">
                <span className="font-semibold">End:</span>{' '}
                {new Date(googleGig.endDateTime).toLocaleString()}
              </p>
              {googleGig.distanceInfo && (
                <div className="text-sm">
                  <span className="font-semibold">Distance:</span>{' '}
                  {googleGig.distanceInfo.miles} mi (
                  {googleGig.distanceInfo.formattedTime})
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">Not in calendar</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <div className="text-sm">
          {hasChanged && (
            <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-2">
              Changes detected
            </span>
          )}
          {hasUpdates && (
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Has updates
            </span>
          )}
        </div>

        <div className="space-x-2">
          {!googleGig && appGig && (
            <button
              onClick={() => onSave(gigId, appGig)}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save to Calendar'}
            </button>
          )}

          {googleGig && hasUpdates && appGig && (
            <button
              onClick={() => onUpdate(gigId, appGig)}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Calendar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
