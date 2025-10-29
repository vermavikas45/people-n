
import { createClient, type Entry, type EntryCollection, type ContentType } from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import type { Article, Bio } from '../types';
import { BLOCKS, type Document } from '@contentful/rich-text-types';
import { CONTENTFUL_CONFIG } from '../config';

// Helper to safely render Rich Text. Moved to module scope for reuse.
const renderRichTextToHtml = (field: unknown): string => {
  if (
    field &&
    typeof field === 'object' &&
    'nodeType' in field &&
    field.nodeType === 'document'
  ) {
    const options = {
      renderNode: {
        [BLOCKS.EMBEDDED_ASSET]: (node: any): string => {
          if (node?.data?.target?.fields) {
              const { title, description, file } = node.data.target.fields;
              const mimeType = file?.contentType;
              const url = file?.url;

              if (mimeType && url && mimeType.startsWith('image/')) {
                return `<img src="https:${url}" alt="${description || title || ''}" class="my-8 rounded-lg shadow-xl" />`;
              }
          }
          return '';
        },
        [BLOCKS.QUOTE]: (node: any, next: (nodes: any) => string): string => {
          return `<blockquote class="border-l-4 border-teal-400 dark:border-teal-500 bg-slate-100 dark:bg-slate-800 p-4 my-6 italic">${next(node.content)}</blockquote>`;
        },
        [BLOCKS.PARAGRAPH]: (node: any, next: (nodes: any) => string): string => {
          const content = next(node.content);
          if (content.trim() === '' || content === '<br>') {
            return '';
          }
          return `<p class="mb-6 leading-relaxed">${content}</p>`;
        }
      },
    };
    return documentToHtmlString(field as Document, options);
  }
  return '<p>Content is not available in the expected format.</p>';
};

// Helper to extract author names. This is now more robust and can handle
// simple text, an array of text, or linked entries from Contentful.
const getAuthorName = (
  authorsField: any,
  includedEntries: Map<string, Entry<any>>
): string => {
  if (!authorsField) {
    return 'Anonymous';
  }

  // Handle simple text field
  if (typeof authorsField === 'string' && authorsField.trim() !== '') {
    return authorsField;
  }

  const getAuthorFromLink = (link: any): string | null => {
    // Case 1: The field is a Link to an Entry (standard `include=1` behavior)
    if (link?.sys?.type === 'Link' && link?.sys?.linkType === 'Entry') {
      const authorEntry = includedEntries.get(link.sys.id);
      if (authorEntry?.fields) {
        return String(authorEntry.fields.name || authorEntry.fields.title || null);
      }
    }
    // Case 2: The field is an already resolved Entry (e.g., `include > 1`)
    else if (link?.sys?.type === 'Entry' && link?.fields) {
      return String(link.fields.name || link.fields.title || null);
    }
    return null;
  };

  // Handle an array of authors (multi-reference field OR array of strings)
  if (Array.isArray(authorsField)) {
    // Handle array of simple strings (e.g., from a 'Tags' field type)
    if (authorsField.every(item => typeof item === 'string')) {
      const names = authorsField.filter(name => name.trim() !== '');
      return names.length > 0 ? names.join(', ') : 'Anonymous';
    }
    
    // Handle array of linked entries
    const authorNames = authorsField
      .map(getAuthorFromLink)
      .filter((name): name is string => name !== null && name !== 'null');
    return authorNames.length > 0 ? authorNames.join(', ') : 'Anonymous';
  }

  // Handle a single linked entry
  const singleAuthorName = getAuthorFromLink(authorsField);
  return singleAuthorName && singleAuthorName !== 'null' ? singleAuthorName : 'Anonymous';
};


// This function maps a Contentful entry to our application's Article type.
const parseContentfulEntry = (
  entry: Entry<any>,
  includedEntries: Map<string, Entry<any>>
): Article => {
  // Safely parse and format the date
  const rawDate = entry.fields.writtendate;
  let formattedDate = '';
  if (rawDate) {
    const dateObj = new Date(rawDate as string);
    // Check if the date is valid before formatting
    if (!isNaN(dateObj.getTime())) {
      formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  return {
    id: entry.sys.id,
    title: String(entry.fields.title || 'Untitled'),
    author: getAuthorName(entry.fields.authors, includedEntries),
    date: formattedDate,
    excerpt: String(entry.fields.excerpt || ''),
    content: renderRichTextToHtml(entry.fields.body),
    tags: Array.isArray(entry.fields.tags) ? entry.fields.tags.map(String) : [],
    comments: [],
  };
};


export const fetchArticles = async (): Promise<Article[]> => {
  const { spaceId, accessToken, contentTypeId } = CONTENTFUL_CONFIG;

  if (!spaceId || !accessToken) {
    throw new Error(
      'Contentful credentials are not set. Please add `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` to your Netlify environment variables.'
    );
  }

  if (!contentTypeId) {
    throw new Error(
        'Contentful Content Type ID is not set. Please add `CONTENTFUL_CONTENT_TYPE_ID` to your Netlify environment variables.'
    );
  }

  const client = createClient({
    space: spaceId,
    accessToken: accessToken,
  });

  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: contentTypeId,
      order: ['-fields.writtendate'], 
      include: 1, // We only need include level 1; our logic will handle the linking.
    });

    if (entries.items) {
      // Create a map for quick lookups of all included entries.
      const includedEntries = new Map<string, Entry<any>>();
      if (entries.includes?.Entry) {
        for (const includedEntry of entries.includes.Entry) {
          includedEntries.set(includedEntry.sys.id, includedEntry);
        }
      }

      return entries.items.reduce((acc: Article[], item: Entry<any>) => {
        try {
          // Pass the lookup map to the parser.
          const article = parseContentfulEntry(item, includedEntries);
          acc.push(article);
        } catch (parseError) {
          console.error(
            `Failed to parse Contentful entry with ID: ${item?.sys?.id}. Skipping.`,
            parseError
          );
        }
        return acc;
      }, []);
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching articles from Contentful:', error);
    
    if (error.name === 'AccessTokenInvalid') {
      throw new Error(
        'Your Contentful Access Token is invalid. Please check the `CONTENTFUL_ACCESS_TOKEN` in your Netlify environment variables.'
      );
    }
    if (error.details?.errors?.[0]?.name === 'unknownContentType') {
        throw new Error(
            `Contentful could not find a Content Type with the ID "${contentTypeId}". Please check the 'CONTENTFUL_CONTENT_TYPE_ID' in your Netlify environment variables.`
        );
    }
    
    throw new Error(
      'Could not connect to the content source. Please check your credentials in your Netlify environment variables and your network connection.'
    );
  }
};

export const fetchBioDescription = async (): Promise<string> => {
  const { spaceId, accessToken } = CONTENTFUL_CONFIG;
  const bioContentTypeId = 'aboutMe';

  if (!spaceId || !accessToken) {
    throw new Error(
      'Contentful credentials are not set. Please add `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` to your Netlify environment variables.'
    );
  }
  
  const client = createClient({
    space: spaceId,
    accessToken: accessToken,
  });

  try {
    const entries = await client.getEntries({
      content_type: bioContentTypeId,
      limit: 1,
    });

    if (entries.items.length > 0) {
      const entry = entries.items[0];
      const descriptionField = entry.fields.description;
      return renderRichTextToHtml(descriptionField);
    }
    // Fallback if no entry is found
    return `<p>About me content is not yet available. Please check back later.</p>`;

  } catch (error: any) {
    console.error('Error fetching bio description from Contentful:', error);
    if (error.name === 'AccessTokenInvalid') {
      throw new Error(
        'Your Contentful Access Token is invalid. Please check the `CONTENTFUL_ACCESS_TOKEN` in your Netlify environment variables.'
      );
    }
    if (error.details?.errors?.[0]?.name === 'unknownContentType') {
        throw new Error(
            `Contentful could not find a Content Type with the ID "${bioContentTypeId}". Please create an 'aboutMe' content type with a 'description' field.`
        );
    }
    throw new Error('Could not fetch "About Me" information from Contentful.');
  }
};

const FALLBACK_BANNER_URL = "https://images.unsplash.com/photo-1579737873652-3a18e001e405?q=80&w=2070&auto=format&fit=crop";

export const fetchAssetUrl = async (assetId: string): Promise<string> => {
  const { spaceId, accessToken } = CONTENTFUL_CONFIG;

  if (!spaceId || !accessToken) {
    console.warn('Contentful credentials are not set, returning fallback banner.');
    return FALLBACK_BANNER_URL;
  }

  const client = createClient({
    space: spaceId,
    accessToken: accessToken,
  });

  try {
    const asset = await client.getAsset(assetId);
    if (asset.fields.file?.url) {
      return `https:${asset.fields.file.url}`;
    }
    console.warn(`Asset with ID ${assetId} found but has no file URL.`);
    return FALLBACK_BANNER_URL;
  } catch (error) {
    console.error(`Error fetching asset ${assetId} from Contentful:`, error);
    return FALLBACK_BANNER_URL;
  }
};

export interface ContentfulField {
  id: string;
  name: string;
  type: string;
}

export const fetchContentType = async (contentTypeId: string): Promise<ContentfulField[]> => {
  const { spaceId, accessToken } = CONTENTFUL_CONFIG;

  if (!spaceId || !accessToken) {
    throw new Error('Contentful credentials are not set in your Netlify environment variables.');
  }

  const client = createClient({
    space: spaceId,
    accessToken: accessToken,
  });

  try {
    const contentType: ContentType = await client.getContentType(contentTypeId);
    if (contentType && contentType.fields) {
      return contentType.fields.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type,
      }));
    }
    return [];
  } catch (error: any) {
    console.error(`Error fetching content type "${contentTypeId}":`, error);
     if (error.sys?.id === 'NotFound') {
       throw new Error(`Content Type with ID "${contentTypeId}" was not found in your Contentful space. Please check the 'CONTENTFUL_CONTENT_TYPE_ID' in your Netlify environment variables.`);
    }
    throw new Error(`Could not fetch content model for "${contentTypeId}". Please check your credentials and network connection.`);
  }
};
