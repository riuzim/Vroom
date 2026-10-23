import { useEffect } from 'react';

/**
 * Simple hook to set document.title and the meta[name="description"] tag.
 * Should be called in pages that have static title/description.
 */
export function usePageMeta({ title, description }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, description]);
}
