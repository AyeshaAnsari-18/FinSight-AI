import { useState, useEffect, useCallback } from "react";
import { accountantApi, type JournalEntry } from "../services/accountant.api";

export const useJournals = () => {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  const fetchJournals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await accountantApi.getJournals();
      setJournals(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load journals. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  
  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  return { journals, loading, error, refetch: fetchJournals };
};