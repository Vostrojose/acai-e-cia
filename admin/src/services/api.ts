import axios from "axios"

const api = axios.create({
  baseURL: "https://api.acaiecompanhia.com.br/api"
})

// 🔐 INTERCEPTOR DE REQUEST
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token")

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// 🚨 INTERCEPTOR DE RESPOSTA (IMPORTANTE)
api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401) {
      console.warn("⚠️ Token inválido ou expirado")

      // 🔥 remove token
      localStorage.removeItem("token")

      // 🔥 redireciona para login (ou produtos)
      window.location.href = "/produtos"
    }

    return Promise.reject(error)
  }
)

export default api