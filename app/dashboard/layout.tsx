import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Fire background effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-red-900/20 via-orange-900/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-48 h-full bg-gradient-to-l from-red-900/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-48 h-full bg-gradient-to-r from-red-900/10 to-transparent" />
      </div>

      <Sidebar />

      <main className="lg:ml-64 min-h-screen flex flex-col relative z-10">
        {children}
      </main>
    </div>
  )
}
