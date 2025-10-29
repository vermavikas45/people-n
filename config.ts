// config.ts
// ------------------------------------------------------------------
// SECURELY CONFIGURE YOUR CONTENTFUL CREDENTIALS
// ------------------------------------------------------------------
// Your Contentful credentials are now managed as environment variables
// in your deployment platform (e.g., Netlify). This is a security
// best practice to avoid exposing secret keys in your code.
//
// You need to set the following environment variables:
// 1. CONTENTFUL_SPACE_ID: Found in Settings > General settings.
// 2. CONTENTFUL_ACCESS_TOKEN: The Content Delivery API token.
// 3. CONTENTFUL_CONTENT_TYPE_ID: The ID of your article content model.
// ------------------------------------------------------------------

export const CONTENTFUL_CONFIG = {
  spaceId: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  contentTypeId: process.env.CONTENTFUL_CONTENT_TYPE_ID,
};
