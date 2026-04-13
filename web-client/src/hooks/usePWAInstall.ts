import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault()

      const promptEvent = e as BeforeInstallPromptEvent

      setDeferredPrompt(promptEvent)
      setIsInstallable(true)

      console.log('💾 App pode ser instalado')
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  async function install() {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()

    const choice = await deferredPrompt.userChoice

    if (choice.outcome === 'accepted') {
      console.log('✅ Usuário instalou o app')
    } else {
      console.log('❌ Usuário recusou')
    }

    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  return {
    isInstallable,
    install
  }
}