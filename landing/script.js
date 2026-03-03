document.addEventListener('DOMContentLoaded', function () {
  const appButton = document.getElementById('appButton')

  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  const isAndroid = /android/i.test(userAgent)
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream

  if (isAndroid) {
    appButton.href = 'https://play.google.com/store/apps/details?id=com.acai.cia'
    appButton.classList.remove('hidden')
  }

  if (isIOS) {
    appButton.href = 'https://apps.apple.com/app/id000000000'
    appButton.classList.remove('hidden')
  }
})
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

if (isMobile) {
  document.getElementById("appButton").classList.remove("hidden");
}