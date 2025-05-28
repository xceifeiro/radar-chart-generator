"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function ImageTestPage() {
  const [labels, setLabels] = useState("")
  const [dados, setDados] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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

      const response = await fetch("/api/radar-chart-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          labels: labelsArray,
          dados: dadosArray,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro na requisição")
      }

      // Converter a resposta SVG em blob e criar URL
      const svgText = await response.text()
      const blob = new Blob([svgText], { type: "image/svg+xml" })
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
      link.download = "radar-chart.svg"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Gerador de Imagem Radar Chart</h1>
        <p className="text-muted-foreground">Gere e baixe gráficos radar como imagem SVG</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuração dos Dados</CardTitle>
            <CardDescription>Insira os labels e dados para gerar a imagem do gráfico</CardDescription>
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

            <div className="flex gap-2">
              <Button onClick={generateImage} disabled={loading} className="flex-1">
                {loading ? "Gerando..." : "Gerar Imagem"}
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
            <CardDescription>Visualize e baixe sua imagem do gráfico radar (formato SVG)</CardDescription>
          </CardHeader>
          <CardContent>
            {imageUrl ? (
              <div className="space-y-4">
                <img src={imageUrl || "/placeholder.svg"} alt="Radar Chart" className="w-full border rounded-lg" />
                <Button onClick={downloadImage} className="w-full">
                  Baixar Imagem SVG
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">Configure os dados e clique em "Gerar Imagem"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como usar a API de Imagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Endpoint:</h4>
            <code className="bg-muted p-2 rounded block">POST /api/radar-chart-image</code>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Exemplo de requisição:</h4>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
              {`curl -X POST https://seu-dominio.vercel.app/api/radar-chart-image \\
  -H "Content-Type: application/json" \\
  -d '{
    "labels": ["Item 1", "Item 2", "Item 3"],
    "dados": [7, 8, 5]
  }' \\
  --output radar-chart.svg`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Resposta:</h4>
            <p className="text-sm text-muted-foreground">
              A API retorna diretamente uma imagem SVG (Content-Type: image/svg+xml) que pode ser salva ou exibida. SVG
              é um formato vetorial que mantém qualidade em qualquer tamanho.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
