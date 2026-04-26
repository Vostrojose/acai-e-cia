import axios from "axios"

const api = axios.create({
  baseURL: "https://api.acaiecompanhia.com.br/api"
})

// 🔐 INTERCEPTOR DE REQUEST
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token")

  if (token) {
    // 🔥 forma correta (compatível com Axios + TS)
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

      localStorage.removeItem("token")

      window.location.href = "/produtos"
    }

    return Promise.reject(error)
  }
)

export default api