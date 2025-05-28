"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function PNGTestPage() {
  const [labels, setLabels] = useState("")
  const [dados, setDados] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [useExternalService, setUseExternalService] = useState(true)
  const [imageFormat, setImageFormat] = useState("png")

  const exampleData = {
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

  const loadExample = () => {
    setLabels(JSON.stringify(exampleData.labels, null, 2))
    setDados(JSON.stringify(exampleData.dados, null, 2))
  }

  const generateImage = async () => {
    setLoading(true)
    setError("")
    setImageUrl("")

    try {
      const labelsArray = JSON.parse(labels)
      const dadosArray = JSON.parse(dados)

      const endpoint = "/api/radar-chart-png"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          labels: labelsArray,
          dados: dadosArray,
          useExternalService,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro na requisição")
      }

      // Verificar o tipo de conteúdo retornado
      const contentType = response.headers.get("content-type")
      setImageFormat(contentType?.includes("svg") ? "svg" : "png")

      // Converter a resposta em blob e criar URL
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setImageUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar dados")
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = () => {
    if (imageUrl) {
      const link = document.createElement("a")
      link.href = imageUrl
      link.download = `radar-chart.${imageFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Gerador de PNG Radar Chart</h1>
        <p className="text-muted-foreground">Gere gráficos radar em formato PNG usando conversão SVG</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuração dos Dados</CardTitle>
            <CardDescription>Insira os labels e dados para gerar a imagem PNG do gráfico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="labels">Labels (JSON Array)</Label>
              <Textarea
                id="labels"
                placeholder='["Label 1", "Label 2", ...]'
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dados">Dados (JSON Array - valores de 0 a 10)</Label>
              <Textarea
                id="dados"
                placeholder="[5, 8, 3, 9, ...]"
                value={dados}
                onChange={(e) => setDados(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="external-service" checked={useExternalService} onCheckedChange={setUseExternalService} />
              <Label htmlFor="external-service">Usar serviço externo para conversão PNG</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={generateImage} disabled={loading} className="flex-1">
                {loading ? "Gerando..." : "Gerar PNG"}
              </Button>
              <Button variant="outline" onClick={loadExample}>
                Exemplo
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imagem Gerada</CardTitle>
            <CardDescription>
              Visualize e baixe sua imagem do gráfico radar (formato {imageFormat.toUpperCase()})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {imageUrl ? (
              <div className="space-y-4">
                <img src={imageUrl || "/placeholder.svg"} alt="Radar Chart" className="w-full border rounded-lg" />
                <Button onClick={downloadImage} className="w-full">
                  Baixar Imagem {imageFormat.toUpperCase()}
                </Button>
                <div className="text-sm text-muted-foreground">
                  {imageFormat === "png" ? (
                    <span className="text-green-600">✅ Convertido para PNG com sucesso!</span>
                  ) : (
                    <span className="text-yellow-600">
                      ⚠️ Fallback: SVG retornado (serviço de conversão indisponível)
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">Configure os dados e clique em "Gerar PNG"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como usar a API PNG</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Endpoint:</h4>
            <code className="bg-muted p-2 rounded block">POST /api/radar-chart-png</code>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Exemplo de requisição:</h4>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
              {`curl -X POST https://seu-dominio.vercel.app/api/radar-chart-png \\
  -H "Content-Type: application/json" \\
  -d '{
    "labels": ["Item 1", "Item 2", "Item 3"],
    "dados": [7, 8, 5],
    "useExternalService": true
  }' \\
  --output radar-chart.png`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Parâmetros:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>
                <code>labels</code>: Array de strings com os rótulos
              </li>
              <li>
                <code>dados</code>: Array de números (0-10) com os valores
              </li>
              <li>
                <code>useExternalService</code>: Boolean (opcional) - usar serviço externo para conversão PNG
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Resposta:</h4>
            <p className="text-sm text-muted-foreground">
              A API retorna uma imagem PNG quando a conversão é bem-sucedida, ou SVG como fallback. O Content-Type
              indica o formato retornado.
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-800">💡 Configuração do Serviço Externo:</h4>
            <p className="text-sm text-blue-700">Para usar o serviço de conversão PNG em produção, você precisa:</p>
            <ol className="text-sm text-blue-700 mt-2 space-y-1">
              <li>1. Criar conta gratuita em htmlcsstoimage.com</li>
              <li>2. Obter suas credenciais de API</li>
              <li>3. Substituir as credenciais demo no código</li>
              <li>4. Configurar variáveis de ambiente HCTI_USER_ID e HCTI_API_KEY</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
