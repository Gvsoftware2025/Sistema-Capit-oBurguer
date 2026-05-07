"use client"

import { useState } from "react"
import {
  Settings,
  Printer,
  Clock,
  Bell,
  Store,
  Save,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function ConfiguracoesView() {
  // Configurações da loja
  const [nomeLoja, setNomeLoja] = useState("Capitão Burguer")
  const [endereco, setEndereco] = useState("")
  const [telefone, setTelefone] = useState("")

  // Horário de funcionamento
  const [horaAbertura, setHoraAbertura] = useState("18:00")
  const [horaFechamento, setHoraFechamento] = useState("23:00")
  const [diasFuncionamento, setDiasFuncionamento] = useState("Ter a Dom")

  // Impressora
  const [impressoraIP, setImpressoraIP] = useState("192.168.1.100")
  const [impressoraPorta, setImpressoraPorta] = useState("9100")
  const [impressaoAutomatica, setImpressaoAutomatica] = useState(true)

  // Notificações
  const [somNotificacao, setSomNotificacao] = useState(true)
  const [volumeSom, setVolumeSom] = useState("80")

  const salvarConfiguracoes = () => {
    // Aqui salvaria no backend
    toast.success("Configurações salvas com sucesso!")
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-serif font-bold text-primary">
            Configurações
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-3xl">
        {/* Informações da Loja */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Informações da Loja</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Loja</Label>
              <Input
                value={nomeLoja}
                onChange={(e) => setNomeLoja(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Textarea
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, bairro, cidade..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone / WhatsApp</Label>
              <Input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        {/* Horário de Funcionamento */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Horário de Funcionamento</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Dias</Label>
              <Input
                value={diasFuncionamento}
                onChange={(e) => setDiasFuncionamento(e.target.value)}
                placeholder="Ex: Ter a Dom"
              />
            </div>
            <div className="space-y-2">
              <Label>Abertura</Label>
              <Input
                type="time"
                value={horaAbertura}
                onChange={(e) => setHoraAbertura(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fechamento</Label>
              <Input
                type="time"
                value={horaFechamento}
                onChange={(e) => setHoraFechamento(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Impressora */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Printer className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Impressora Térmica</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Endereço IP</Label>
                <Input
                  value={impressoraIP}
                  onChange={(e) => setImpressoraIP(e.target.value)}
                  placeholder="192.168.1.100"
                />
              </div>
              <div className="space-y-2">
                <Label>Porta</Label>
                <Input
                  value={impressoraPorta}
                  onChange={(e) => setImpressoraPorta(e.target.value)}
                  placeholder="9100"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-background">
              <div>
                <p className="font-medium">Impressão Automática</p>
                <p className="text-sm text-muted-foreground">
                  Imprimir pedido automaticamente ao receber
                </p>
              </div>
              <Switch
                checked={impressaoAutomatica}
                onCheckedChange={setImpressaoAutomatica}
              />
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Notificações</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-background">
              <div>
                <p className="font-medium">Som de Notificação</p>
                <p className="text-sm text-muted-foreground">
                  Tocar som ao receber novo pedido
                </p>
              </div>
              <Switch checked={somNotificacao} onCheckedChange={setSomNotificacao} />
            </div>
            {somNotificacao && (
              <div className="space-y-2">
                <Label>Volume ({volumeSom}%)</Label>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={volumeSom}
                  onChange={(e) => setVolumeSom(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Salvar */}
        <Button onClick={salvarConfiguracoes} className="w-full sm:w-auto gap-2">
          <Save className="h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
