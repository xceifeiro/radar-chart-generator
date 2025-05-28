"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import RadarChartComponent from "./components/radar-chart"

export default function HomePage() {
  const [labels, setLabels] = useState("")
  const [dados, setDados] = useState("")
  const [chartData, setChartData] = useState(null)
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

  const generateChart = async () => {
    setLoading(true)
    setError("")

    try {
      const labelsArray = JSON.parse(labels)
      const dadosArray = JSON.parse(dados)

      const response = await fetch("/api/radar-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          labels: labelsArray,
          dados: dadosArray,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro na requisição")
      }

      setChartData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar dados")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">API Radar Chart Generator</h1>
        <p className="text-muted-foreground">Gere gráficos radar personalizados com seus dados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuração dos Dados</CardTitle>
            <CardDescription>Insira os labels e dados para gerar o gráfico radar</CardDescription>
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
              <Button onClick={generateChart} disabled={loading} className="flex-1">
                {loading ? "Gerando..." : "Gerar Gráfico"}
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
            <CardTitle>Gráfico Radar</CardTitle>
            <CardDescription>Visualização dos seus dados em formato radar</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData ? (
              <RadarChartComponent data={chartData} />
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">Configure os dados e clique em "Gerar Gráfico"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como usar a API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Endpoint:</h4>
            <code className="bg-muted p-2 rounded block">POST /api/radar-chart</code>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Exemplo de requisição:</h4>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
              {`curl -X POST http://localhost:3000/api/radar-chart \\
  -H "Content-Type: application/json" \\
  -d '{
    "labels": ["Item 1", "Item 2", "Item 3"],
    "dados": [7, 8, 5]
  }'`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Resposta:</h4>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
              {`{
  "success": true,
  "data": [
    {"subject": "Item 1", "value": 7, "fullMark": 10},
    {"subject": "Item 2", "value": 8, "fullMark": 10},
    {"subject": "Item 3", "value": 5, "fullMark": 10}
  ],
  "metadata": {
    "totalItems": 3,
    "maxValue": 10,
    "minValue": 0
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
