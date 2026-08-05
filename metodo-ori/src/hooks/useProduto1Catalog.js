import { useEffect, useState } from "react";

import { getProduto1Catalogo } from "../services/api";
import { migrateProduto1PremiumCache } from "../utils/produto1Cache";

const emptyCatalog = {
  version: "",
  questions: [],
  total_questions: 0,
  archetypes: {},
  combinations: {},
  reports: {},
};

export function useProduto1Catalog() {
  const [catalog, setCatalog] = useState(emptyCatalog);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState("empty");

  useEffect(() => {
    let mounted = true;
    migrateProduto1PremiumCache();

    async function loadCatalog() {
      try {
        const data = await getProduto1Catalogo();

        if (!mounted) return;

        setCatalog(data || emptyCatalog);
        setError(null);
        setSource("api");
      } catch (apiError) {
        if (!mounted) return;

        setCatalog(emptyCatalog);
        setSource("empty");
        setError(apiError);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCatalog();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    catalog,
    questions: catalog.questions || [],
    reports: catalog.reports || {},
    archetypes: catalog.archetypes || {},
    combinations: catalog.combinations || {},
    loading,
    error,
    source,
  };
}
