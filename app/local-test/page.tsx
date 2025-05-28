"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

export default function LocalTestPage() {
  const [labels, setLabels] = useState("")
  const [dados, setDados] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [format, setFormat] = useState("png")
  const [quality, setQuality] = useState([90])
  const [width, setWidth] = useState([800])
  const [height, setHeight] = useState([600])
  const [density, setDensity] = useState([300])
  const [title, setTitle] = useState("Gráfico Radar - Avaliação Pessoal")
  const [conversionTime, setConversionTime] = useState("")
  const [fileSize, setFileSize] = useState("")

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
    setConversionTime("")
    setFileSize("")

    try {
      const labelsArray = JSON.parse(labels)
      const dadosArray = JSON.parse(dados)

      const startTime = Date.now()

      const response = await fetch("/api/radar-chart-png-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          labels: labelsArray,
          dados: dadosArray,
          format,
          options: {
            width: width[0],
            height: height[0],
            quality: quality[0],
            density: density[0],
            title,
            colors: {
              primary: "rgba(54, 162, 235, 1)",
              primaryFill: "rgba(54, 162, 235, 0.2)",
              grid: "#e0e0e0",
              axis: "#ccc",
              text: "#333",
              background: "white",
            },
          },
        }),
      })

      const endTime = Date.now()
      setConversionTime(`${endTime - startTime}ms`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro na requisição")
      }

      // Obter informações do arquivo
      const contentLength = response.headers.get("content-length")
      if (contentLength) {
        const sizeKB = Math.round(Number.parseInt(contentLength) / 1024)
        setFileSize(`${sizeKB}KB`)
      }

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
      link.download = `radar-chart.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Gerador Local de Imagens Radar Chart</h1>
        <p className="text-muted-foreground">Conversão local usando Sharp - rápida e confiável</p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">🚀 Conversão Local</Badge>
          <Badge variant="secondary">⚡ Sharp</Badge>
          <Badge variant="secondary">🎨 Múltiplos Formatos</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuração dos Dados</CardTitle>
            <CardDescription>Configure os dados e opções de conversão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="labels">Labels (JSON Array)</Label>
              <Textarea
                id="labels"
                placeholder='["Label 1", "Label 2", ...]'
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dados">Dados (JSON Array - valores de 0 a 10)</Label>
              <Textarea
                id="dados"
                placeholder="[5, 8, 3, 9, ...]"
                value={dados}
                onChange={(e) => setDados(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título do Gráfico</Label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Formato</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="svg">SVG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Qualidade: {quality[0]}%</Label>
                <Slider value={quality} onValueChange={setQuality} min={10} max={100} step={5} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Largura: {width[0]}px</Label>
                <Slider value={width} onValueChange={setWidth} min={200} max={2000} step={50} />
              </div>

              <div className="space-y-2">
                <Label>Altura: {height[0]}px</Label>
                <Slider value={height} onValueChange={setHeight} min={200} max={2000} step={50} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>DPI: {density[0]}</Label>
              <Slider value={density} onValueChange={setDensity} min={72} max={600} step={24} />
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
            <CardDescription>
              Resultado da conversão local ({format.toUpperCase()})
              {conversionTime && (
                <span className="ml-2">
                  - ⚡ {conversionTime} {fileSize && `- 📁 ${fileSize}`}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {imageUrl ? (
              <div className="space-y-4">
                <img src={imageUrl || "/placeholder.svg"} alt="Radar Chart" className="w-full border rounded-lg" />
                <div className="flex gap-2">
                  <Button onClick={downloadImage} className="flex-1">
                    Baixar {format.toUpperCase()}
                  </Button>
                  <Badge variant="outline">✅ Conversão Local</Badge>
                </div>
                {conversionTime && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>⚡ Tempo de conversão: {conversionTime}</div>
                    {fileSize && <div>📁 Tamanho do arquivo: {fileSize}</div>}
                    <div>
                      🎯 Resolução: {width[0]}x{height[0]}px
                    </div>
                    <div>🎨 Qualidade: {quality[0]}%</div>
                  </div>
                )}
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
          <CardTitle>Vantagens da Conversão Local</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-green-600">✅ Benefícios</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Conversão muito mais rápida</li>
              <li>• Sem dependência de APIs externas</li>
              <li>• Sem limites de uso</li>
              <li>• Maior privacidade dos dados</li>
              <li>• Suporte a múltiplos formatos</li>
              <li>• Controle total da qualidade</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-600">🎯 Formatos Suportados</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• SVG - Vetorial, escalável</li>
              <li>• PNG - Transparência, alta qualidade</li>
              <li>• JPEG - Menor tamanho, fotos</li>
              <li>• WebP - Moderno, otimizado</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como usar a API Local</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Endpoint:</h4>
            <code className="bg-muted p-2 rounded block">POST /api/radar-chart-png-local</code>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Exemplo de requisição:</h4>
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
      "density": 300,
      "title": "Meu Gráfico"
    }
  }' \\
  --output chart.png`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Parâmetros disponíveis:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>
                <code>format</code>: "svg", "png", "jpeg", "webp"
              </li>
              <li>
                <code>options.width/height</code>: Dimensões em pixels
              </li>
              <li>
                <code>options.quality</code>: Qualidade 1-100
              </li>
              <li>
                <code>options.density</code>: DPI para impressão
              </li>
              <li>
                <code>options.title</code>: Título personalizado
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
