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

      const confirmar = confirm(
        '📲 Instalar o aplicativo?\n\n✔ Acesso mais rápido\n✔ Funciona como app\n✔ Sem precisar abrir navegador'
      )

      if (!confirmar) return

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
      alert('📲 Para instalar:\n\n1. Toque no botão "Compartilhar"\n2. Depois em "Adicionar à Tela de Início"')
    } else {
      alert('📲 Para instalar:\n\n1. Abra o menu do navegador (⋮)\n2. Toque em "Adicionar à tela inicial"')
    }
  }
})