import { useEffect, useState } from "react";

import { getProduto1Catalogo } from "../services/api";

const CATALOG_CACHE_KEY = "ori_produto_1_catalogo";
const emptyCatalog = {
  version: "",
  questions: [],
  total_questions: 0,
  archetypes: {},
  combinations: {},
  reports: {},
};

function readCachedCatalog() {
  try {
    const raw = localStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed?.catalog || null;
  } catch (error) {
    console.log("Erro ao ler catálogo do Produto 1 em cache:", error);
    return null;
  }
}

function writeCachedCatalog(catalog) {
  try {
    localStorage.setItem(
      CATALOG_CACHE_KEY,
      JSON.stringify({
        cachedAt: new Date().toISOString(),
        catalog,
      }),
    );
  } catch (error) {
    console.log("Erro ao salvar catálogo do Produto 1 em cache:", error);
  }
}

export function useProduto1Catalog() {
  const [catalog, setCatalog] = useState(() => readCachedCatalog() || emptyCatalog);
  const [loading, setLoading] = useState(() => !readCachedCatalog());
  const [error, setError] = useState(null);
  const [source, setSource] = useState(() =>
    readCachedCatalog() ? "cache" : "empty",
  );

  useEffect(() => {
    let mounted = true;

    async function loadCatalog() {
      try {
        const data = await getProduto1Catalogo();

        if (!mounted) return;

        setCatalog(data || emptyCatalog);
        setError(null);
        setSource("api");
        writeCachedCatalog(data || emptyCatalog);
      } catch (apiError) {
        const cached = readCachedCatalog();

        if (!mounted) return;

        if (cached) {
          setCatalog(cached);
          setSource("cache");
        } else {
          setCatalog(emptyCatalog);
          setSource("empty");
        }

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
