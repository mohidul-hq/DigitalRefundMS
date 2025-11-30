// Appwrite client initialization
// Replace placeholders below with your Appwrite IDs
// - projectId
// - endpoint (e.g., 'https://cloud.appwrite.io/v1' or your self-hosted endpoint)
// - databaseId
// - collectionId
// - POLICY_BUCKET_ID (for PDF files)
// - KYC_BUCKET_ID (for image files)

import { Client, Databases, Storage, ID, Query, Account } from 'appwrite'

// Read runtime config from Vite env (supports .env files)
// Vite exposes env vars prefixed with VITE_
const {
  VITE_APPWRITE_ENDPOINT,
  VITE_APPWRITE_PROJECT_ID,
  VITE_APPWRITE_DATABASE_ID,
  VITE_APPWRITE_COLLECTION_ID,
  VITE_POLICY_BUCKET_ID,
  VITE_APPWRITE_POLICY_BUCKET_ID,
} = import.meta.env

export const config = {
  endpoint: VITE_APPWRITE_ENDPOINT,
  projectId: VITE_APPWRITE_PROJECT_ID,
  databaseId: VITE_APPWRITE_DATABASE_ID,
  collectionId: VITE_APPWRITE_COLLECTION_ID,
  POLICY_BUCKET_ID: VITE_POLICY_BUCKET_ID || VITE_APPWRITE_POLICY_BUCKET_ID, // fallback for legacy var name
}

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // must be https://cloud.appwrite.io/v1
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

export const databases = new Databases(client)
export const storage = new Storage(client)
export const account = new Account(client)
export { ID, Query }
