import axios from "axios"

const api = axios.create({
  baseURL: "https://api.acaiecompanhia.com.br/api"
})

// 🔐 INTERCEPTOR DE REQUEST
api.interceptors.request.use((config) => {

  const token = sessionStorage.getItem("token")

  // 🔥 NÃO envia token para login
  if (token && !config.url?.includes("/auth/login")) {
    config.headers = config.headers ?? {}
    ;(config.headers as any).Authorization = `Bearer ${token}`
  }

  return config
})

// 🚨 INTERCEPTOR DE RESPOSTA (IMPORTANTE)
api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("⚠️ Token inválido, expirado ou sem permissão")

      // 🔥 CORRIGIDO → sessionStorage
      sessionStorage.removeItem("token")
    }

    return Promise.reject(error)
  }
)

export default api