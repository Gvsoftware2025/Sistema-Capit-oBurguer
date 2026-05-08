import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Conteudo principal */}
      <main className="flex-1 min-h-screen flex flex-col relative">
        {/* Efeito de fogo no fundo */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-red-950/20 via-orange-950/10 to-transparent" />
          <div className="absolute bottom-0 right-0 w-48 h-full bg-gradient-to-l from-orange-950/10 to-transparent" />
        </div>

        {/* Conteudo */}
        <div className="relative z-10 flex flex-col flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}
