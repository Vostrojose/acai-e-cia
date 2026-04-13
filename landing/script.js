document.addEventListener('DOMContentLoaded', function () {
  const appButton = document.getElementById('appButton')

  if (!appButton) return

  let deferredPrompt = null

  /* ============================= */
  /* 🔥 PWA INSTALL                */
  /* ============================= */
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()

    deferredPrompt = e

    console.log('💾 App pode ser instalado')

    appButton.classList.remove('hidden')
    appButton.innerText = '📲 Instalar aplicativo'
  })

  /* ============================= */
  /* 🖱️ CLIQUE                     */
  /* ============================= */
  appButton.addEventListener('click', async (e) => {
    e.preventDefault()

    if (deferredPrompt) {
      deferredPrompt.prompt()

      const choice = await deferredPrompt.userChoice

      if (choice.outcome === 'accepted') {
        console.log('✅ Usuário instalou')
      } else {
        console.log('❌ Usuário recusou')
      }

      deferredPrompt = null
      appButton.classList.add('hidden')
      return
    }

    // 🔥 fallback (abre site)
    window.location.href = 'https://pedido.acaiecompanhia.com.br'
  })

  /* ============================= */
  /* ⏱️ EXIBIÇÃO CONTROLADA        */
  /* ============================= */
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)

  if (isMobile) {
    const jaMostrou = localStorage.getItem('pwa_prompt')

    if (!jaMostrou) {
      setTimeout(() => {
        appButton.classList.remove('hidden')
        appButton.innerText = '📱 Usar como aplicativo'
        localStorage.setItem('pwa_prompt', 'true')
      }, 4000)
    }
  }
})