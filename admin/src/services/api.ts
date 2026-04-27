import axios from "axios"

const api = axios.create({
  baseURL: "https://api.acaiecompanhia.com.br/api"
})

// 🔐 REQUEST
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token")

  const isLogin = config.url?.includes("/auth/login")

  // 🔥 SÓ envia se token EXISTE de verdade
  if (token && token !== "undefined" && !isLogin) {
    (config.headers as any) = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`
    }
  }

  return config
})

// 🚨 RESPONSE
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("⚠️ Token inválido, expirado ou sem permissão")

      sessionStorage.removeItem("token")
    }

    return Promise.reject(error)
  }
)

export default api
