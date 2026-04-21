import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

function recoverStuckInteractionLock() {
  const hasOpenDialog = document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]')
  if (!hasOpenDialog && document.body.style.pointerEvents === 'none') {
    document.body.style.pointerEvents = ''
  }
}

export function AppLayout() {
  const location = useLocation()

  useEffect(() => {
    const observer = new MutationObserver(() => {
      recoverStuckInteractionLock()
    })

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['style', 'data-scroll-locked'],
    })

    const handleWindowFocus = () => recoverStuckInteractionLock()

    recoverStuckInteractionLock()
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      observer.disconnect()
      window.removeEventListener('focus', handleWindowFocus)
      recoverStuckInteractionLock()
    }
  }, [])

  useEffect(() => {
    recoverStuckInteractionLock()
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(18,131,115,0.08),_transparent_28%),hsl(var(--background))]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
