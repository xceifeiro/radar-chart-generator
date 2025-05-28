"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RadarChartComponent from "../components/radar-chart"

export default function TestPage() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)

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

    try {
      const response = await fetch("/api/radar-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste da API Radar Chart</CardTitle>
          <CardDescription>Teste rápido com dados de exemplo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testAPI} disabled={loading}>
            {loading ? "Testando..." : "Testar API"}
          </Button>

          {result && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Resposta da API:</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
              </div>

              {result.success && (
                <div>
                  <h3 className="font-semibold mb-2">Gráfico Gerado:</h3>
                  <div className="border rounded-lg p-4">
                    <RadarChartComponent data={result.data} />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
