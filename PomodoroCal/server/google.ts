import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
];

const TOKENS_PATH = path.join(process.cwd(), 'tokens.json');

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth credentials. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI environment variables.');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const oauth2Client = getOAuth2Client();
  
  const { tokens } = await oauth2Client.getAccessToken(code);
  
  if (!tokens.access_token) {
    throw new Error('Failed to obtain access token');
  }

  // Store tokens to file
  await saveTokens(tokens as GoogleTokens);
  
  return tokens as GoogleTokens;
}

export async function getStoredTokens(): Promise<GoogleTokens | null> {
  try {
    const tokensData = await fs.readFile(TOKENS_PATH, 'utf8');
    return JSON.parse(tokensData);
  } catch (error) {
    return null;
  }
}

export async function saveTokens(tokens: GoogleTokens): Promise<void> {
  try {
    await fs.writeFile(TOKENS_PATH, JSON.stringify(tokens, null, 2));
  } catch (error) {
    console.error('Failed to save tokens:', error);
  }
}

export async function getCalendarClient(tokens?: GoogleTokens) {
  const oauth2Client = getOAuth2Client();
  
  const storedTokens = tokens || await getStoredTokens();
  if (!storedTokens) {
    throw new Error('No valid tokens found. Please authenticate first.');
  }

  oauth2Client.setCredentials(storedTokens);

  // Refresh token if expired
  if (storedTokens.expiry_date && Date.now() >= storedTokens.expiry_date) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      await saveTokens(credentials as GoogleTokens);
      oauth2Client.setCredentials(credentials);
    } catch (error) {
      throw new Error('Failed to refresh access token. Please re-authenticate.');
    }
  }

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function revokeTokens(): Promise<void> {
  const tokens = await getStoredTokens();
  if (!tokens) return;

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);
  
  try {
    await oauth2Client.revokeCredentials();
  } catch (error) {
    console.error('Failed to revoke tokens:', error);
  }
  
  // Delete stored tokens
  try {
    await fs.unlink(TOKENS_PATH);
  } catch (error) {
    // File might not exist, ignore error
  }
}
