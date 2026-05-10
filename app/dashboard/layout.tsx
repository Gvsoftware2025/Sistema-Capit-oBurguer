import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Conteudo principal - padding left no mobile para o botao hamburger */}
      <main className="lg:ml-56 min-h-screen flex flex-col relative">
        {/* Efeito de fogo no fundo */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-red-950/15 to-transparent" />
        </div>

        {/* Conteudo */}
        <div className="relative z-10 flex flex-col flex-1 pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
