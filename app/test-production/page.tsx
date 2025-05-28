"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestProductionPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testData = {
    labels: [
      "Espiritualidade",
      "Saúde e Disposição",
      "Desenvolvimento Intelectual",
      "Equilíbrio Emocional",
      "Realização e Propósito",
      "Recursos Financeiros",
      "Contribuição Social",
      "Família",
      "Desenvolvimento Amoroso",
      "Vida Social",
      "Criatividade e Diversão",
      "Plenitude e Felicidade",
    ],
    dados: [6, 8, 9, 8, 8, 6, 3, 8, 10, 5, 7, 7],
  }

  const runTests = async () => {
    setLoading(true)
    setResults([])

    const tests = [
      {
        name: "SVG Original",
        endpoint: "/api/radar-chart-image",
        expectedType: "image/svg+xml",
      },
      {
        name: "PNG Local",
        endpoint: "/api/radar-chart-png-local",
        expectedType: "image/png",
        body: { ...testData, format: "png" },
      },
      {
        name: "PNG Simples",
        endpoint: "/api/radar-chart-png",
        expectedType: "image/png",
        body: { ...testData, useExternalService: true },
      },
    ]

    for (const test of tests) {
      try {
        const startTime = Date.now()

        const response = await fetch(test.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(test.body || testData),
        })

        const endTime = Date.now()
        const duration = endTime - startTime

        const contentType = response.headers.get("content-type")
        const contentLength = response.headers.get("content-length")
        const isFallback = response.headers.get("x-fallback") === "true"

        let imageUrl = ""
        let errorMessage = null

        if (response.ok) {
          const blob = await response.blob()
          imageUrl = URL.createObjectURL(blob)
        } else {
          try {
            const errorText = await response.text()
            errorMessage = errorText || "Erro na requisição"
          } catch {
            errorMessage = `Erro HTTP ${response.status}`
          }
        }

        setResults((prev) => [
          ...prev,
          {
            name: test.name,
            success: response.ok,
            status: response.status,
            contentType,
            expectedType: test.expectedType,
            contentLength: contentLength ? Math.round(Number(contentLength) / 1024) + "KB" : "N/A",
            duration: duration + "ms",
            imageUrl,
            isFallback,
            error: errorMessage,
          },
        ])
      } catch (error) {
        setResults((prev) => [
          ...prev,
          {
            name: test.name,
            success: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          },
        ])
      }
    }

    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Teste de Produção - APIs Radar Chart</h1>
        <p className="text-muted-foreground">Teste todas as APIs com as credenciais de produção configuradas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Executar Testes</CardTitle>
          <CardDescription>Testa todos os endpoints com dados reais</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runTests} disabled={loading} className="w-full">
            {loading ? "Executando Testes..." : "Executar Todos os Testes"}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Resultados dos Testes</h2>

          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{result.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "✅ Sucesso" : "❌ Falha"}
                    </Badge>
                    {result.isFallback && <Badge variant="secondary">🔄 Fallback</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>Status:</strong> {result.status || "N/A"}
                  </div>
                  <div>
                    <strong>Tipo:</strong> {result.contentType || "N/A"}
                  </div>
                  <div>
                    <strong>Tamanho:</strong> {result.contentLength || "N/A"}
                  </div>
                  <div>
                    <strong>Tempo:</strong> {result.duration || "N/A"}
                  </div>
                </div>

                {result.contentType && result.expectedType && (
                  <div className="text-sm">
                    <strong>Tipo Esperado:</strong> {result.expectedType}
                    {result.contentType === result.expectedType ? (
                      <span className="text-green-600 ml-2">✅ Correto</span>
                    ) : (
                      <span className="text-yellow-600 ml-2">⚠️ Diferente (pode ser fallback)</span>
                    )}
                  </div>
                )}

                {result.error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">
                      <strong>Erro:</strong> {result.error}
                    </p>
                  </div>
                )}

                {result.imageUrl && (
                  <div className="space-y-2">
                    <strong>Imagem Gerada:</strong>
                    <img
                      src={result.imageUrl || "/placeholder.svg"}
                      alt={`Resultado ${result.name}`}
                      className="max-w-md border rounded"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Exemplos de Uso em Produção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Conversão Local (Recomendado):</h4>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
              {`curl -X POST https://seu-dominio.vercel.app/api/radar-chart-png-local \\
  -H "Content-Type: application/json" \\
  -d '{
    "labels": ["Item 1", "Item 2", "Item 3"],
    "dados": [7, 8, 5],
    "format": "png",
    "options": {
      "width": 800,
      "height": 600,
      "quality": 95,
      "title": "Meu Gráfico"
    }
  }' \\
  --output chart.png`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. JavaScript/TypeScript:</h4>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
              {`const response = await fetch('/api/radar-chart-png-local', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    labels: ["Espiritualidade", "Saúde"],
    dados: [6, 8],
    format: "png",
    options: { width: 800, height: 600 }
  })
});

if (response.ok) {
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  // Usar a URL para exibir ou baixar
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
