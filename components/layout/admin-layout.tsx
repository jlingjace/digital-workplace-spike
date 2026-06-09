import { AdminSidebar } from './sidebar'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-warning-container border-b border-warning flex items-center px-6 gap-2 shrink-0">
          <span className="text-warning-on-container text-sm font-medium">
            ⚠️ You are operating in Admin Mode
          </span>
        </header>
        <main className="flex-1 p-6 bg-[#f8f9fa]">{children}</main>
      </div>
    </div>
  )
}
