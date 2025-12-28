# Clockwork Calendar (Next.js)

A Next.js reimplementation of the Clockwork Calendar application - a personal scheduling assistant for managing band gig schedules.

## Features

- **Google OAuth Authentication** via Clerk
- **Email Integration** - Fetches and parses scheduling emails from Gmail
- **Calendar Sync** - Integrates with Google Calendar
- **Distance Calculation** - Uses Google Maps API to calculate travel info
- **Smart Event Titles** - Generates formatted titles with emojis, drive time, and location hints
- **Change Detection** - Compares email vs calendar data to identify updates

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Clerk (Authentication)
- Google APIs (Gmail, Calendar, Maps)
- Tailwind CSS
- Cheerio (HTML parsing)
- DayJS (Date manipulation)

## Setup

### 1. Install Dependencies

\`\`\`bash
yarn install
\`\`\`

### 2. Configure Clerk

1. Create an account at [Clerk.com](https://clerk.com)
2. Create a new application
3. Enable Google OAuth provider in Clerk dashboard
4. Add the following scopes to Google OAuth:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. Create a JWT template named "google" in Clerk that includes the Google OAuth access token

### 3. Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable these APIs:
   - Gmail API
   - Google Calendar API
   - Google Maps Distance Matrix API
4. Create a Maps API Key (for Distance Matrix API)
5. Use the same OAuth credentials in both Clerk and your Google Cloud project

### 4. Environment Variables

Create a \`.env.local\` file:

\`\`\`
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Google API Key (for Maps)
GOOGLE_API_KEY=AIza...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/select-calendar
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/select-calendar
\`\`\`

### 5. Run Development Server

\`\`\`bash
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in Vercel project settings
4. Deploy
5. Update Clerk redirect URLs to include production URL

## How It Works

1. **Authentication**: Users sign in with Google via Clerk
2. **Calendar Selection**: User selects which Google Calendar to sync
3. **Email Parsing**: Fetches latest "Clockwork East Coast - Schedule" email from Gmail
4. **Data Comparison**: Compares email gigs with calendar events
5. **Distance Calculation**: Calculates drive time and distance from home
6. **Save/Update**: Allows saving new events or updating existing ones

## Architecture

- **App Router**: Server components for data fetching
- **API Routes**: Handle event save/update operations
- **Models**: Class-based domain models (EmailGig, GoogleGig, FullCalendarGig)
- **Services**: Gmail, Calendar, and Distance services with OAuth client injection
- **Parsers**: HTML email parser to extract gig details

## Original Project

This is a Next.js reimplementation of the original Remix-based Clockwork Calendar.
