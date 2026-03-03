export function isAuthenticated() {
  const token = localStorage.getItem('acai_token')
  return !!token
}

export function logout() {
  localStorage.removeItem('acai_token')
}
