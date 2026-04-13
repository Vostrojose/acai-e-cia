document.addEventListener('DOMContentLoaded', function () {
  const appButton = document.getElementById('appButton')

  if (!appButton) return

  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  const isAndroid = /android/i.test(userAgent)
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream

  let deferredPrompt = null

  /* ============================= */
  /* 🔥 PWA INSTALL (PRIORIDADE)   */
  /* ============================= */
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()

    deferredPrompt = e

    console.log('💾 App pode ser instalado')

    appButton.classList.remove('hidden')
    appButton.innerText = '📲 Instalar aplicativo'
  })

  /* ============================= */
  /* 📱 FALLBACK LOJAS (CASO NÃO PWA) */
  /* ============================= */
  if (isAndroid) {
    appButton.dataset.store = 'android'
    appButton.href = 'https://play.google.com/store/apps/details?id=com.acai.cia'
  }

  if (isIOS) {
    appButton.dataset.store = 'ios'
    appButton.href = 'https://apps.apple.com/app/id000000000'
  }

  /* ============================= */
  /* 🖱️ CLIQUE NO BOTÃO           */
  /* ============================= */
  appButton.addEventListener('click', async (e) => {

    // 🔥 se PWA disponível → usa install
    if (deferredPrompt) {
      e.preventDefault()

      deferredPrompt.prompt()

      const choice = await deferredPrompt.userChoice

      if (choice.outcome === 'accepted') {
        console.log('✅ Usuário instalou o app')
      } else {
        console.log('❌ Usuário recusou')
      }

      deferredPrompt = null
      appButton.classList.add('hidden')
      return
    }

    // 📱 fallback → abre loja (não impede comportamento)
    console.log('📱 Redirecionando para loja')
  })

  /* ============================= */
  /* 📊 CONTROLE DE EXIBIÇÃO       */
  /* ============================= */
  const isMobile = /Android|iPhone|iPad/i.test(userAgent)

  if (isMobile) {
    const jaMostrou = localStorage.getItem('pwa_prompt')

    if (!jaMostrou) {
      setTimeout(() => {
        appButton.classList.remove('hidden')
        localStorage.setItem('pwa_prompt', 'true')
      }, 4000)
    }
  }
})