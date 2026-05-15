"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UploadInstaladorPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success: boolean
    url?: string
    error?: string
  } | null>(null)

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/installer/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUploadResult({ success: true, url: result.url })
      } else {
        setUploadResult({ success: false, error: result.error })
      }
    } catch {
      setUploadResult({ success: false, error: 'Erro ao fazer upload' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.exe') || file.name.endsWith('.msi'))) {
      handleUpload(file)
    } else {
      setUploadResult({ success: false, error: 'Apenas arquivos .exe ou .msi sao permitidos' })
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Link>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Upload do Instalador</CardTitle>
            <CardDescription>
              Envie o arquivo .exe do instalador do Capitao Burguer para disponibilizar o download automatico no site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`
                border-2 border-dashed rounded-xl p-12 text-center transition-colors
                ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 hover:border-primary/50'}
                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
              `}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="text-lg font-medium">Enviando instalador...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Arraste o arquivo .exe aqui</p>
                  <p className="text-muted-foreground mb-4">ou</p>
                  <label>
                    <input
                      type="file"
                      accept=".exe,.msi"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>Selecionar arquivo</span>
                    </Button>
                  </label>
                </>
              )}
            </div>

            {uploadResult && (
              <div className={`mt-6 p-4 rounded-lg ${uploadResult.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <div className="flex items-center gap-3">
                  {uploadResult.success ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <p className={`font-medium ${uploadResult.success ? 'text-green-500' : 'text-red-500'}`}>
                      {uploadResult.success ? 'Upload concluido com sucesso!' : 'Erro no upload'}
                    </p>
                    {uploadResult.success && uploadResult.url && (
                      <p className="text-sm text-muted-foreground mt-1">
                        O botao de download no site ja esta funcionando automaticamente.
                      </p>
                    )}
                    {uploadResult.error && (
                      <p className="text-sm text-red-400 mt-1">{uploadResult.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Como obter o instalador:</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>No seu computador, va ate a pasta do projeto</li>
                <li>Execute: <code className="bg-background px-1 rounded">pnpm tauri:build</code></li>
                <li>O instalador estara em: <code className="bg-background px-1 rounded">src-tauri/target/release/bundle/nsis/</code></li>
                <li>Envie o arquivo que termina com <code className="bg-background px-1 rounded">-setup.exe</code></li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
