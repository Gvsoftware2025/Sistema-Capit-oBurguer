import { CarrinhoProvider } from "@/hooks/use-carrinho"

export default function CardapioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CarrinhoProvider>{children}</CarrinhoProvider>
}
