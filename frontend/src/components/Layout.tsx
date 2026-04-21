import { Outlet, Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav, MobileHeader } from './BottomNav'
import { useAuthStore } from '../store/authStore'

export function Layout() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
