import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Fire/glow background effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-red-950/30 via-orange-950/15 to-transparent" />
        <div className="absolute bottom-0 right-0 w-64 h-full bg-gradient-to-l from-orange-950/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-64 h-full bg-gradient-to-r from-red-950/10 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
      </div>

      <Sidebar />

      <main className="lg:ml-56 min-h-screen flex flex-col relative z-10">
        {children}
      </main>
    </div>
  )
}
