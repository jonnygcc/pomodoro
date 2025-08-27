# Alegra Time - Calendar-Aware Pomodoro

A modern Pomodoro timer application with Google Calendar integration, smart meeting detection, and focus block creation. Built with React, TypeScript, Express, and Tailwind CSS.

## Features

- 🍅 **Pomodoro Timer**: Customizable work/break intervals with circular progress visualization
- 📅 **Google Calendar Integration**: OAuth 2.0 authentication with calendar read/write permissions
- 🧠 **Smart Adjust**: Automatically suggests timer adjustments to finish before upcoming meetings
- 📋 **Task Management**: Track tasks with pomodoro completion counters
- 📊 **Daily Progress**: Visual progress tracking and statistics
- 🔔 **Notifications**: Browser notifications for timer completion
- 🎯 **Focus Blocks**: Creates calendar events for focus sessions

## Setup Instructions

### 1. Enable Google Calendar API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Add your redirect URI:
   - For development: `https://your-repl-name.replit.app/api/oauth2callback`
   - Replace `your-repl-name` with your actual Repl name
5. Note down your **Client ID** and **Client Secret**

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Fill in the required information:
   - App name: "Alegra Time"
   - User support email: Your email
   - Developer contact information: Your email
3. Add scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/calendar.events`
4. Add test users (your email) if the app is in testing mode

### 4. Environment Variables

Set the following environment variables in your Repl secrets or `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://your-repl-name.replit.app/api/oauth2callback
SESSION_SECRET=your_secure_random_string_here
```

### 5. Install Dependencies and Run

```bash
npm install
npm run dev
```

## Testing the Application

### Complete Test Flow

1. **Start the Application**
   - Run `npm run dev`
   - Navigate to your Repl URL in a browser

2. **Authenticate with Google Calendar**
   - The app will automatically log you in with demo credentials
   - Click on any Calendar-related feature to initiate OAuth
   - You'll be redirected to Google's consent screen
   - Grant permissions for calendar read/write access
   - You'll be redirected back to the application

3. **Test Pomodoro Timer**
   - Select a task or create a new one
   - Start a Pomodoro session (25 minutes by default)
   - Test pause/resume functionality
   - Let it complete to see notifications

4. **Test Smart Adjust Feature**
   - Schedule a meeting in your Google Calendar within the next 30 minutes
   - Start a Pomodoro session
   - The app should suggest adjusting the timer to finish before your meeting

5. **Test Focus Block Creation**
   - Start a Pomodoro session
   - Check your Google Calendar to confirm a "Focus — [Task Name]" event was created

6. **Verify Calendar Integration**
   - Check that upcoming meetings appear in the "Next Meeting" section
   - Verify the app refreshes calendar data every minute

## API Endpoints

### Authentication
- `POST /api/login` - Demo login
- `GET /api/auth` - Initiate Google OAuth
- `GET /api/oauth2callback` - OAuth callback
- `POST /api/logout` - Logout and revoke tokens

### Calendar
- `GET /api/next-events?window=<minutes>` - Get upcoming events (default 180 minutes)

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Focus Blocks
- `POST /api/focus-block` - Create focus block and calendar event

## Troubleshooting

### Common OAuth Issues

1. **Redirect URI Mismatch**
   ```
   Error: redirect_uri_mismatch
   ```
   - Ensure the redirect URI in Google Cloud Console exactly matches your Repl URL
   - Format: `https://your-repl-name.replit.app/api/oauth2callback`

2. **Invalid Client ID/Secret**
   ```
   Error: invalid_client
   ```
   - Verify your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
   - Check that environment variables are properly set in Repl secrets

3. **Consent Screen Issues**
   ```
   Error: access_denied
   ```
   - Ensure your app is published or you're added as a test user
   - Check that required scopes are configured in OAuth consent screen

4. **Invalid Scope**
   ```
   Error: invalid_scope
   ```
   - Verify scopes are enabled in Google Cloud Console:
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/calendar.events`

### Clock Skew Issues

If you see token expiration errors:
1. Refresh the page to get new tokens
2. Ensure your system clock is synchronized
3. Check that the Repl environment time is correct

### Calendar Not Updating

If events don't appear or refresh:
1. Verify OAuth permissions include calendar access
2. Check the browser console for API errors
3. Try logging out and re-authenticating
4. Ensure your Google Calendar has events in the next 3 hours

### Notifications Not Working

If browser notifications don't appear:
1. Grant notification permissions when prompted
2. Check browser notification settings
3. Ensure the tab is active or enable background notifications

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Authentication**: Google OAuth 2.0
- **State Management**: TanStack Query (React Query)
- **Calendar Integration**: Google Calendar API
- **UI Components**: Radix UI with custom theming
- **Notifications**: Web Notifications API

## Architecture

### Frontend Components
- `Pomodoro.tsx` - Main timer interface with circular progress
- `TaskList.tsx` - Task management with completion tracking
- `Progress.tsx` - Daily progress visualization
- `NextMeeting.tsx` - Meeting display and Smart Adjust suggestions
- `Controls.tsx` - Timer control buttons

### Backend Services
- `google.ts` - OAuth client and token management
- `calendar.ts` - Calendar event fetching and creation
- `storage.ts` - In-memory task and focus block storage
- `routes.ts` - API endpoint handlers

### Key Features
- **Smart Meeting Detection**: Analyzes upcoming calendar events
- **Auto-Adjust Suggestions**: Prevents Pomodoro conflicts with meetings
- **Focus Block Creation**: Automatically creates calendar events for work sessions
- **Real-time Updates**: Calendar data refreshes every 60 seconds
- **Notification System**: Browser notifications for session completion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the complete OAuth flow
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.
