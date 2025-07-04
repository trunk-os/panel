// Runtime configuration - this file will be replaced at container startup
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '${VITE_API_BASE_URL}',
  ENABLE_DEBUG_TOOLS: import.meta.env.VITE_ENABLE_DEBUG_TOOLS || '${VITE_ENABLE_DEBUG_TOOLS}',
  DEV_HOST: import.meta.env.DEV_HOST || '${DEV_HOST}'
};