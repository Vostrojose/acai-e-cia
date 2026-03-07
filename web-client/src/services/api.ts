import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.acaiecompanhia.com.br/api'
})

export default api
