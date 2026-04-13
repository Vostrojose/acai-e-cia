document.addEventListener('DOMContentLoaded', function () {
  const appButton = document.getElementById('appButton')
  if (!appButton) return

  let deferredPrompt = null

  /* ============================= */
  /* 🔥 CAPTURA PWA                */
  /* ============================= */
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e

    console.log('💾 Pode instalar')

    appButton.innerText = '📲 Instalar aplicativo'
  })

  /* ============================= */
  /* 🖱️ CLICK                     */
  /* ============================= */
  appButton.addEventListener('click', async (e) => {
    e.preventDefault()

    // 🔥 PWA disponível
    if (deferredPrompt) {
      deferredPrompt.prompt()

      const choice = await deferredPrompt.userChoice

      if (choice.outcome === 'accepted') {
        console.log('✅ Instalado')
      } else {
        console.log('❌ Cancelado')
      }

      deferredPrompt = null
      return
    }

    // ⚠️ fallback inteligente
    mostrarInstrucaoInstalacao()
  })

  /* ============================= */
  /* 📱 INSTRUÇÃO MANUAL           */
  /* ============================= */
  function mostrarInstrucaoInstalacao() {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (isIOS) {
      alert('Para instalar: toque em "Compartilhar" → "Adicionar à Tela de Início"')
    } else {
      alert('Para instalar: use o menu do navegador → "Adicionar à tela inicial"')
    }
  }
})