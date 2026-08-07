import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase';

// Setup provider with required Gmail scopes
export const gmailProvider = new GoogleAuthProvider();
gmailProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
gmailProvider.addScope('https://www.googleapis.com/auth/gmail.send');

let cachedAccessToken: string | null = null;

export const setCachedGmailAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const getCachedGmailAccessToken = (): string | null => {
  return cachedAccessToken;
};

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessageDetail {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  subject?: string;
  from?: string;
  date?: string;
  body?: string;
}

/**
 * Sign in with Google to obtain OAuth access token with Gmail scopes
 */
export const connectGmailAccount = async (): Promise<{ email: string; token: string }> => {
  try {
    const result = await signInWithPopup(auth, gmailProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Unable to obtain Google OAuth access token for Gmail.');
    }
    cachedAccessToken = credential.accessToken;
    return {
      email: result.user.email || 'Gmail User',
      token: credential.accessToken,
    };
  } catch (err) {
    console.error('Error connecting to Gmail API:', err);
    throw err;
  }
};

/**
 * Fetch maintenance / failure related emails from user's Gmail
 */
export const fetchGmailMaintenanceEmails = async (
  accessToken: string,
  query: string = 'subject:GMAO OR subject:Failure OR subject:Maintenance OR subject:WorkOrder'
): Promise<GmailMessageDetail[]> => {
  try {
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=${encodeURIComponent(query)}`;
    const res = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Access token expired or invalid. Please sign in again.');
      }
      throw new Error(`Gmail API Error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    if (!data.messages || !Array.isArray(data.messages)) {
      return [];
    }

    // Fetch full detail for each message
    const details = await Promise.all(
      data.messages.slice(0, 8).map(async (msg: { id: string }) => {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!detailRes.ok) return null;
        const detailData = await detailRes.json();

        const headers: GmailMessageHeader[] = detailData.payload?.headers || [];
        const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
        const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || 'Unknown';
        const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';

        return {
          id: detailData.id,
          threadId: detailData.threadId,
          snippet: detailData.snippet || '',
          internalDate: detailData.internalDate || '',
          subject,
          from,
          date,
        };
      })
    );

    return details.filter((d): d is GmailMessageDetail => d !== null);
  } catch (err) {
    console.error('Error fetching Gmail messages:', err);
    throw err;
  }
};

/**
 * Helper to encode UTF-8 string to base64url format for Gmail API
 */
const utf8ToBase64Url = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Send an email via Gmail API
 */
export const sendGmailNotification = async (
  accessToken: string,
  to: string,
  subject: string,
  bodyText: string
): Promise<{ id: string; threadId: string }> => {
  const emailContent = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    bodyText,
  ].join('\r\n');

  const raw = utf8ToBase64Url(emailContent);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to send email via Gmail API (${res.status}): ${errorText}`);
  }

  return await res.json();
};
