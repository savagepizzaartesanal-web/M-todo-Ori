import { supabase } from "../lib/supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_TIMEOUT_MS = 12000;
const READING_TIMEOUT_MS = 120000;
const FILE_TIMEOUT_MS = 180000;
const AI_DRAFT_TIMEOUT_MS = 240000;

export class OriApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "OriApiError";
    this.status = options.status || null;
    this.details = options.details || "";
    this.isTimeout = Boolean(options.isTimeout);
    this.isNetworkError = Boolean(options.isNetworkError);
    this.userMessage =
      options.userMessage ||
      "O ORI está demorando um pouco para sincronizar. Você pode continuar; seus dados serão preservados.";
  }
}

async function requestApi(
  path,
  { timeoutMs = API_TIMEOUT_MS, ...options } = {},
) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    const isTimeout = error?.name === "AbortError";

    throw new OriApiError(
      isTimeout
        ? "Tempo limite ao conectar com a API ORI."
        : "Não foi possível conectar com a API ORI.",
      {
        isTimeout,
        isNetworkError: !isTimeout,
        userMessage: isTimeout
          ? "O ORI está acordando a leitura. Aguarde alguns segundos e tente novamente."
          : "Não conseguimos sincronizar com o ORI agora. Você pode continuar; vamos manter o que já foi salvo.",
      },
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new OriApiError(
      `Erro na API ORI: ${response.status}${details ? ` - ${details}` : ""}`,
      {
        status: response.status,
        details,
        userMessage:
          response.status === 401
            ? "Sua sessão precisa ser atualizada. Entre novamente para continuar com segurança."
            : "Não conseguimos concluir a sincronização agora. Tente novamente em alguns instantes.",
      },
    );
  }

  return response.json();
}

async function getSupabaseAccessToken() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new OriApiError("Não foi possível ler a sessão atual.", {
      userMessage:
        "Não conseguimos confirmar sua sessão agora. Atualize a página ou entre novamente.",
    });
  }

  return data.session?.access_token || null;
}

async function requestAuthenticatedApi(path, options = {}) {
  const token = await getSupabaseAccessToken();

  if (!token) {
    throw new OriApiError("Sessão não encontrada.", {
      status: 401,
      userMessage:
        "Sua sessão expirou. Entre novamente para continuar sua jornada ORI.",
    });
  }

  return requestApi(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

async function requestAuthenticatedFile(path, options = {}) {
  const token = await getSupabaseAccessToken();

  if (!token) {
    throw new OriApiError("Sessão não encontrada.", {
      status: 401,
      userMessage:
        "Sua sessão expirou. Entre novamente para continuar sua jornada ORI.",
    });
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), FILE_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch (error) {
    const isTimeout = error?.name === "AbortError";

    throw new OriApiError(
      isTimeout
        ? "Tempo limite ao conectar com a API ORI."
        : "Não foi possível conectar com a API ORI.",
      {
        isTimeout,
        isNetworkError: !isTimeout,
        userMessage: isTimeout
          ? "O ORI ainda está preparando o arquivo. Aguarde mais alguns instantes e tente baixar novamente."
          : "Não conseguimos baixar o arquivo agora. Tente novamente em alguns instantes.",
      },
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new OriApiError(
      `Erro na API ORI: ${response.status}${details ? ` - ${details}` : ""}`,
      {
        status: response.status,
        details,
        userMessage:
          response.status === 401
            ? "Sua sessão precisa ser atualizada. Entre novamente para baixar o PDF."
            : "Não conseguimos gerar o PDF agora. Tente novamente em alguns instantes.",
      },
    );
  }

  const disposition = response.headers.get("Content-Disposition") || "";
  const filenameMatch = disposition.match(/filename="([^"]+)"/);

  return {
    blob: await response.blob(),
    filename: filenameMatch?.[1] || "codigo-das-deusas.pdf",
  };
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

export function getProduto1Catalogo() {
  return requestApi("/api/produto-1/catalogo");
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

export function resetProduto1() {
  return requestAuthenticatedApi("/api/produto-1/reset", {
    method: "POST",
  });
}

export function getProduto1Reading() {
  return requestAuthenticatedApi("/api/produto-1/leitura/me", {
    timeoutMs: READING_TIMEOUT_MS,
  });
}

export function getProduto1Report() {
  return requestAuthenticatedApi("/api/produto-1/relatorio/me", {
    timeoutMs: READING_TIMEOUT_MS,
  });
}

export function downloadProduto1ReportPdf() {
  return requestAuthenticatedFile("/api/produto-1/relatorio/me/pdf");
}

export function getProduto2Dossie() {
  return requestAuthenticatedApi("/api/produto-2/me");
}

export function saveProduto2Insumos(insumos) {
  return requestAuthenticatedApi("/api/produto-2/insumos", {
    method: "POST",
    body: JSON.stringify({ insumos }),
  });
}

export function submitProduto2Insumos(insumos) {
  return requestAuthenticatedApi("/api/produto-2/enviar", {
    method: "POST",
    body: JSON.stringify({ insumos }),
  });
}

export function getProduto3CodigoFinal() {
  return requestAuthenticatedApi("/api/produto-3/me");
}

export function saveProduto3Insumos(insumos) {
  return requestAuthenticatedApi("/api/produto-3/insumos", {
    method: "POST",
    body: JSON.stringify({ insumos }),
  });
}

export function submitProduto3Insumos(insumos) {
  return requestAuthenticatedApi("/api/produto-3/enviar", {
    method: "POST",
    body: JSON.stringify({ insumos }),
  });
}

export function getCurrentApiUser() {
  return requestAuthenticatedApi("/api/me");
}

export function getCurrentJornada() {
  return requestAuthenticatedApi("/api/jornada/me");
}

export function getMapaVivo() {
  return requestAuthenticatedApi("/api/mapa-vivo/me");
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

export function getProduto1Feedback(context = "espelho-ori") {
  return requestAuthenticatedApi(
    `/api/feedback/produto-1/me?context=${encodeURIComponent(context)}`,
  );
}

export function saveProduto1Feedback(feedbackData) {
  return requestAuthenticatedApi("/api/feedback/produto-1", {
    method: "POST",
    body: JSON.stringify(feedbackData),
  });
}

export function getAdminClientes() {
  return requestAuthenticatedApi("/api/admin/clientes");
}

export function getAdminCliente(clienteId) {
  return requestAuthenticatedApi(
    `/api/admin/clientes/${encodeURIComponent(clienteId)}`,
  );
}

export function updateAdminCliente(clienteId, updates) {
  return requestAuthenticatedApi(
    `/api/admin/clientes/${encodeURIComponent(clienteId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(updates),
    },
  );
}

export function createAdminClienteEvento(clienteId, payload) {
  return requestAuthenticatedApi(
    `/api/admin/clientes/${encodeURIComponent(clienteId)}/eventos`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function generateAdminAiMessage(clienteId, payload) {
  return requestAuthenticatedApi(
    `/api/admin/clientes/${encodeURIComponent(clienteId)}/mensagem-ia`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function getAdminProduto2(clienteId) {
  return requestAuthenticatedApi(
    `/api/admin/produto-2/${encodeURIComponent(clienteId)}`,
  );
}

export function updateAdminProduto2(clienteId, updates) {
  return requestAuthenticatedApi(
    `/api/admin/produto-2/${encodeURIComponent(clienteId)}`,
    {
      method: "PUT",
      body: JSON.stringify(updates),
    },
  );
}

export function generateAdminProduto2AiDraft(clienteId) {
  return requestAuthenticatedApi(
    `/api/admin/produto-2/${encodeURIComponent(clienteId)}/rascunho-ia`,
    {
      method: "POST",
      timeoutMs: AI_DRAFT_TIMEOUT_MS,
    },
  );
}

export function publishAdminProduto2(clienteId, payload) {
  return requestAuthenticatedApi(
    `/api/admin/produto-2/${encodeURIComponent(clienteId)}/publicar`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function unpublishAdminProduto2(clienteId) {
  return requestAuthenticatedApi(
    `/api/admin/produto-2/${encodeURIComponent(clienteId)}/despublicar`,
    {
      method: "POST",
    },
  );
}

export function getAdminProduto3(clienteId) {
  return requestAuthenticatedApi(
    `/api/admin/produto-3/${encodeURIComponent(clienteId)}`,
  );
}

export function updateAdminProduto3(clienteId, updates) {
  return requestAuthenticatedApi(
    `/api/admin/produto-3/${encodeURIComponent(clienteId)}`,
    {
      method: "PUT",
      body: JSON.stringify(updates),
    },
  );
}

export function publishAdminProduto3(clienteId, payload) {
  return requestAuthenticatedApi(
    `/api/admin/produto-3/${encodeURIComponent(clienteId)}/publicar`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function unpublishAdminProduto3(clienteId) {
  return requestAuthenticatedApi(
    `/api/admin/produto-3/${encodeURIComponent(clienteId)}/despublicar`,
    {
      method: "POST",
    },
  );
}

export { API_BASE_URL };
