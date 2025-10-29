import React, { useState, useEffect } from 'react';
import { fetchContentType, type ContentfulField } from '../services/contentfulService';

interface ContentfulDebugProps {
  contentTypeId: string;
}

export const ContentfulDebug: React.FC<ContentfulDebugProps> = ({ contentTypeId }) => {
  const [fields, setFields] = useState<ContentfulField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContentType = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedFields = await fetchContentType(contentTypeId);
        setFields(fetchedFields);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching the content model.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (contentTypeId) {
        loadContentType();
    } else {
        setError("Content Type ID is not defined in config.ts.");
        setIsLoading(false);
    }
  }, [contentTypeId]);

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500"></div>
        </div>
      );
    }

    if (error) {
      return <p className="text-red-700 dark:text-red-300">{error}</p>;
    }

    if (fields.length === 0) {
      return <p className="text-slate-600 dark:text-slate-400">No fields found for this content type.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead className="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-200">Field ID</th>
              <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-200">Field Name</th>
              <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-200">Type</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.id} className="border-b border-slate-200 dark:border-slate-700">
                <td className="px-4 py-2 text-slate-600 dark:text-slate-300"><code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded-md text-sm">{field.id}</code></td>
                <td className="px-4 py-2 text-slate-800 dark:text-slate-100">{field.name}</td>
                <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{field.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Use the <strong>Field ID</strong> in your code (e.g., in <code>services/contentfulService.ts</code>) to access the content for each field. For example, to get the author, you might need to use <code>entry.fields.authorName</code> if the Field ID is <code>authorName</code>.
        </p>
      </div>
    );
  };

  return (
    <div className="mt-8 max-w-2xl mx-auto bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
            Content Model Inspector for '<code>{contentTypeId || "Not Found"}</code>'
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            There seems to be an issue fetching your articles. This inspector can help you debug by showing the exact structure of your Content Type from Contentful. Compare the 'Field ID' column below with the fields you're trying to access in the <code>services/contentfulService.ts</code> file.
        </p>
        {renderBody()}
    </div>
  );
};