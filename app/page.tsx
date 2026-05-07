import Image from "next/image"
import Link from "next/link"
import { Instagram, MapPin, MessageCircle, UtensilsCrossed } from "lucide-react"
import { Embers } from "@/components/embers"
import { statusLoja } from "@/lib/horario"

export default function HomePage() {
  const status = statusLoja()

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-background">
      {/* Fundo do convés pirata */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/pirate-deck-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.16_0.015_50/0.6)_100%)]" />
      </div>

      {/* Brasas subindo */}
      <Embers count={40} />

      {/* Conteúdo */}
      <section className="relative z-10 flex min-h-dvh flex-col items-center justify-between px-6 py-10">
        {/* Logo no topo */}
        <div className="flex w-full justify-center pt-2 sm:pt-4">
          <div className="relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 animate-flicker">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.16_75/0.45)_0%,transparent_65%)] blur-xl" />
            <Image
              src="/logo-capitao-burguer.jpeg"
              alt="Capitão Burguer"
              fill
              priority
              className="relative rounded-full object-cover ring-2 ring-primary/40 shadow-[0_0_60px_oklch(0.78_0.16_75/0.4)]"
            />
          </div>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="font-serif tracking-[0.35em] text-primary/90 text-xs sm:text-sm md:text-base">
            BEM-VINDO A BORDO
          </p>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider text-glow-red text-balance">
            CAPITÃO BURGUER
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-foreground/80 text-pretty">
            O hambúrguer que domina os sete mares
          </p>

          {/* Status */}
          <div
            className={`bracket-frame mt-2 flex items-center gap-3 rounded-md border ${
              status.aberto
                ? "border-primary/50 bg-primary/10"
                : "border-destructive/50 bg-destructive/10"
            } px-5 py-3`}
          >
            <span
              className={`relative flex h-3 w-3 ${
                status.aberto ? "" : ""
              }`}
              aria-hidden
            >
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                  status.aberto ? "bg-primary" : "bg-destructive"
                } opacity-75`}
              />
              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${
                  status.aberto ? "bg-primary" : "bg-destructive"
                }`}
              />
            </span>
            <div className="text-left">
              <p
                className={`font-serif text-sm font-bold tracking-widest ${
                  status.aberto ? "text-primary" : "text-destructive"
                }`}
              >
                {status.label}
              </p>
              <p className="text-xs text-foreground/70">{status.sublabel}</p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/cardapio"
            className="bracket-frame group mt-2 flex items-center gap-3 rounded-md border border-primary/60 bg-background/40 px-10 py-3.5 backdrop-blur-sm transition-all hover:bg-primary/15 hover:shadow-[0_0_30px_oklch(0.78_0.16_75/0.5)]"
          >
            <UtensilsCrossed className="h-5 w-5 text-primary transition-transform group-hover:rotate-12" />
            <span className="font-serif text-base font-semibold tracking-wider text-primary">
              Ver Cardápio
            </span>
          </Link>
        </div>

        {/* Redes sociais */}
        <div className="flex items-center gap-8 pb-2 sm:gap-12">
          <SocialIcon
            href="https://wa.me/5500000000000"
            label="WhatsApp"
            color="oklch(0.7 0.18 145)"
          >
            <MessageCircle className="h-6 w-6" />
          </SocialIcon>
          <SocialIcon
            href="https://instagram.com"
            label="Instagram"
            color="oklch(0.65 0.22 350)"
          >
            <Instagram className="h-6 w-6" />
          </SocialIcon>
          <SocialIcon
            href="https://maps.google.com"
            label="Localização"
            color="oklch(0.7 0.2 30)"
          >
            <MapPin className="h-6 w-6" />
          </SocialIcon>
        </div>
      </section>

      {/* Acessos rápidos staff */}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5 sm:right-4 sm:top-4">
        <Link
          href="/cozinha"
          className="rounded-md border border-border/50 bg-background/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary"
        >
          Cozinha
        </Link>
        <Link
          href="/funcionario"
          className="rounded-md border border-border/50 bg-background/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary"
        >
          Funcionário
        </Link>
        <Link
          href="/historico"
          className="rounded-md border border-border/50 bg-background/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary"
        >
          Histórico
        </Link>
      </div>
    </main>
  )
}

function SocialIcon({
  href,
  label,
  color,
  children,
}: {
  href: string
  label: string
  color: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-1.5 transition-transform hover:-translate-y-1"
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background/60 text-foreground backdrop-blur-sm transition-shadow"
        style={{
          borderColor: color,
          boxShadow: `0 0 18px ${color.replace(")", " / 0.5)")}`,
          color,
        }}
      >
        {children}
      </span>
      <span className="text-xs text-foreground/70">{label}</span>
    </a>
  )
}
