/// <reference types="vite/client" />

// config.ts
// ------------------------------------------------------------------
// SECURELY CONFIGURE YOUR CONTENTFUL CREDENTIALS
// ------------------------------------------------------------------
// Your Contentful credentials are now managed as environment variables
// in your deployment platform (e.g., Netlify). This is a security
// best practice to avoid exposing secret keys in your code.
//
// In a modern frontend build environment like Vite, only environment
// variables prefixed with `VITE_` are exposed to the client-side code.
//
// You need to set the following environment variables in your Netlify settings:
// 1. VITE_CONTENTFUL_SPACE_ID: Found in Settings > General settings.
// 2. VITE_CONTENTFUL_ACCESS_TOKEN: The Content Delivery API token.
// 3. VITE_CONTENTFUL_CONTENT_TYPE_ID: The ID of your article content model.
// ------------------------------------------------------------------

export const CONTENTFUL_CONFIG = {
  spaceId: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
  contentTypeId: import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE_ID,
};