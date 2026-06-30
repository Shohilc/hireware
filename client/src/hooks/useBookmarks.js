import { useState, useEffect } from 'react';
import api from '../lib/axios';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/jobs/bookmarks');
      setBookmarks(data);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (jobId) => {
    try {
      const { data } = await api.post(`/jobs/${jobId}/bookmark`);
      if (data.bookmarked) {
        await fetchBookmarks();
      } else {
        setBookmarks((prev) => prev.filter((b) => b._id !== jobId));
      }
      return data;
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return { bookmarks, loading, fetchBookmarks, toggleBookmark };
}
