import { Client, Databases, Query, ID } from 'appwrite';

// Sanitize helper removes accidental wrapping quotes from .env values
const sanitize = (v) => (v || '').replace(/^"|"$/g, '').trim();

// Raw env values (may contain quotes)
const RAW_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const RAW_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const RAW_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const RAW_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// Sanitized, exported constants
const APPWRITE_ENDPOINT = sanitize(RAW_ENDPOINT);
const APPWRITE_PROJECT_ID = sanitize(RAW_PROJECT_ID);
const APPWRITE_DATABASE_ID = sanitize(RAW_DATABASE_ID);
const APPWRITE_COLLECTION_ID = sanitize(RAW_COLLECTION_ID);

const client = new Client();
let clientConfigured = false;
if (APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID) {
  try {
    client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
    clientConfigured = true;
  } catch (e) {
    console.error('[Appwrite] Client configuration error:', e);
  }
} else {
  console.error('[Appwrite] Missing endpoint or project ID. Set VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID');
}

if (!APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_ID) {
  console.error('[Appwrite] Missing database or collection ID env vars. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_COLLECTION_ID');
} else {
  // Heuristic: collection IDs typically look like a 20+ char alphanumeric string; warn if looks like a plain name
  if (!/^\w{8,}$/.test(APPWRITE_COLLECTION_ID) || APPWRITE_COLLECTION_ID.includes('-')) {
    console.warn('[Appwrite] Collection ID value might be a name ("' + APPWRITE_COLLECTION_ID + '") instead of the generated ID. Ensure you copied the ID from the console, not the label.');
  }
}

const databases = new Databases(client);

/** Simple connectivity check returning boolean */
/**
 * Perform a lightweight connectivity & permission check.
 * Returns an object: { ok: boolean, stage: string, error?: string }
 */
export async function appwritePing() {
  if (!clientConfigured) {
    return { ok: false, stage: 'client', error: 'Client not configured (endpoint/project missing).' };
  }
  if (!APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_ID) {
    return { ok: false, stage: 'ids', error: 'Database or Collection ID missing.' };
  }
  try {
    await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, [Query.limit(1)]);
    return { ok: true, stage: 'list' };
  } catch (e) {
    const msg = e?.message || String(e);
    // Common hints based on message patterns
    let hint = '';
    if (/CORS|cors/i.test(msg)) hint = 'CORS: Add http://localhost:5173 as allowed origin in Appwrite project settings.';
    else if (/404/gi.test(msg)) hint = 'Not Found: Verify Database ID and Collection ID are correct (use the ID, not the name).';
    else if (/401|permission|unauthorized/i.test(msg)) hint = 'Auth: Ensure project ID is correct and API permissions allow listing documents (or set collection to read for any).';
    else if (/network|failed to fetch/i.test(msg)) hint = 'Network: Check endpoint URL includes /v1 and is reachable from your machine.';
    return { ok: false, stage: 'list', error: msg + (hint ? ' | ' + hint : '') };
  }
}

// Export sanitized IDs for use in components
export { databases, Query, ID, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID };
