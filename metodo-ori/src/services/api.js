import { supabase } from "../lib/supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function requestApi(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(
      `Erro na API ORI: ${response.status}${details ? ` - ${details}` : ""}`,
    );
  }

  return response.json();
}

async function getSupabaseAccessToken() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error("Não foi possível ler a sessão atual.");
  }

  return data.session?.access_token || null;
}

async function requestAuthenticatedApi(path, options = {}) {
  const token = await getSupabaseAccessToken();

  if (!token) {
    throw new Error("Sessão não encontrada.");
  }

  return requestApi(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export function getApiStatus() {
  return requestApi("/");
}

export function getApiHealth() {
  return requestApi("/health");
}

export function getBackendStatus() {
  return requestApi("/api/status");
}

export function calculateQuizResult(answers) {
  return requestApi("/api/quiz/calculate", {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function saveProduto1Answers(answers) {
  return requestAuthenticatedApi("/api/produto-1/respostas", {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function getProduto1Answers() {
  return requestAuthenticatedApi("/api/produto-1/respostas/me");
}

export function completeProduto1(answers) {
  return requestAuthenticatedApi("/api/produto-1/concluir", {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function getProduto1Reading() {
  return requestAuthenticatedApi("/api/produto-1/leitura/me");
}

export function getCurrentApiUser() {
  return requestAuthenticatedApi("/api/me");
}

export function getCurrentJornada() {
  return requestAuthenticatedApi("/api/jornada/me");
}

export function getDailyOracleCard(dateKey) {
  return requestAuthenticatedApi(
    `/api/oraculo/carta-dia/me?date_key=${encodeURIComponent(dateKey)}`,
  );
}

export function saveDailyOracleCard(cardData) {
  return requestAuthenticatedApi("/api/oraculo/carta-dia", {
    method: "POST",
    body: JSON.stringify(cardData),
  });
}

export { API_BASE_URL };
