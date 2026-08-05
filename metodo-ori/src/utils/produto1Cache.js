export const PRODUTO1_CACHE_MIGRATION_VERSION = "g4b-freemium-v1";
export const PRODUTO1_CACHE_VERSION_KEY = "ori_produto_1_cache_version";
export const PRODUTO1_CATALOG_CACHE_KEY = "ori_produto_1_catalogo";
export const PRODUTO1_LEGACY_QUIZ_KEY = "ori_produto_1_quiz";
export const PRODUTO1_CHECKOUT_ORDER_KEY = "ori_produto_1_checkout_order_id";

export function getProduto1QuizStorageKey(userId) {
  return userId ? `ori_produto_1_quiz_${userId}` : "ori_produto_1_quiz_guest";
}

function isProduto1PersonalCacheKey(key) {
  return (
    key === PRODUTO1_LEGACY_QUIZ_KEY ||
    key === PRODUTO1_CHECKOUT_ORDER_KEY ||
    key === getProduto1QuizStorageKey(null) ||
    key.startsWith("ori_produto_1_quiz_")
  );
}

export function migrateProduto1PremiumCache() {
  try {
    if (
      localStorage.getItem(PRODUTO1_CACHE_VERSION_KEY) ===
      PRODUTO1_CACHE_MIGRATION_VERSION
    ) {
      return;
    }

    localStorage.removeItem(PRODUTO1_CATALOG_CACHE_KEY);
    localStorage.setItem(
      PRODUTO1_CACHE_VERSION_KEY,
      PRODUTO1_CACHE_MIGRATION_VERSION,
    );
  } catch (error) {
    console.log("Erro ao migrar cache do Produto 1:", error);
  }
}

export function clearProduto1PersonalCaches() {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (isProduto1PersonalCacheKey(key)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.log("Erro ao limpar cache personalizado do Produto 1:", error);
  }
}

export function rememberProduto1CheckoutOrder(orderId) {
  try {
    if (orderId) {
      localStorage.setItem(PRODUTO1_CHECKOUT_ORDER_KEY, orderId);
    }
  } catch (error) {
    console.log("Erro ao salvar pedido temporário do Produto 1:", error);
  }
}

export function forgetProduto1CheckoutOrder() {
  try {
    localStorage.removeItem(PRODUTO1_CHECKOUT_ORDER_KEY);
  } catch (error) {
    console.log("Erro ao limpar pedido temporário do Produto 1:", error);
  }
}
