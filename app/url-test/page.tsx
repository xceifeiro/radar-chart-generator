"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function URLTestPage() {
  const [labels, setLabels] = useState("")
  const [dados, setDados] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [rawResponse, setRawResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [format, setFormat] = useState("png")
  const [quality, setQuality] = useState([90])
  const [width, setWidth] = useState([800])
  const [height, setHeight] = useState([600])
  const [density, setDensity] = useState([150])
  const [title, setTitle] = useState("Gráfico Radar - Avaliação Pessoal")
  const [responseTime, setResponseTime] = useState("")
  const [imageSize, setImageSize] = useState("")
  const [origin, setOrigin] = useState("")

  // Definir a origem apenas no cliente para evitar erros de SSR
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

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
    setRawResponse("")
    setResponseTime("")
    setImageSize("")

    try {
      const labelsArray = JSON.parse(labels)
      const dadosArray = JSON.parse(dados)

      const startTime = Date.now()

      const response = await fetch("/api/radar-chart-url", {
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
      setResponseTime(`${endTime - startTime}ms`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro na requisição")
      }

      // Obter resposta JSON
      const result = await response.json()
      setRawResponse(JSON.stringify(result, null, 2))

      if (result.success && result.imageUrl) {
        setImageUrl(result.imageUrl)
        setImageSize(formatBytes(result.size))
      } else {
        throw new Error("URL da imagem não encontrada na resposta")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar dados")
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  const copyImageUrl = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl)
      alert("URL da imagem copiada para a área de transferência!")
    }
  }

  const copyJsonResponse = () => {
    if (rawResponse) {
      navigator.clipboard.writeText(rawResponse)
      alert("Resposta JSON copiada para a área de transferência!")
    }
  }

  const copyN8nExample = () => {
    const n8nExample = `// Configuração para N8N
// 1. Adicione um HTTP Request node
// 2. Configure como abaixo:

// Método: POST
// URL: ${origin}/api/radar-chart-url
// Headers: Content-Type: application/json
// Body (JSON):
${JSON.stringify(
  {
    labels: exampleData.labels,
    dados: exampleData.dados,
    format: "png",
    options: {
      width: width[0],
      height: height[0],
      quality: quality[0],
      title: "Gráfico Radar - Avaliação Pessoal",
    },
  },
  null,
  2,
)}

// 3. A resposta será um JSON com a URL da imagem no campo "imageUrl"
// 4. Use um Set node para extrair a URL: $json["imageUrl"]`

    navigator.clipboard.writeText(n8nExample)
    alert("Exemplo para N8N copiado para a área de transferência!")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Gerador de URL de Imagem Radar Chart</h1>
        <p className="text-muted-foreground">Gere URLs de imagens para integração com N8N e outras ferramentas</p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">🔗 URL da Imagem</Badge>
          <Badge variant="secondary">🔄 Integração N8N</Badge>
          <Badge variant="secondary">📊 Múltiplos Formatos</Badge>
        </div>
      </div>

      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="generator">Gerador de URL</TabsTrigger>
          <TabsTrigger value="n8n">Integração N8N</TabsTrigger>
          <TabsTrigger value="api">Documentação API</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
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

                <div className="flex gap-2">
                  <Button onClick={generateImage} disabled={loading} className="flex-1">
                    {loading ? "Gerando..." : "Gerar URL da Imagem"}
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
                  Visualização da imagem via URL ({format.toUpperCase()})
                  {responseTime && (
                    <span className="ml-2">
                      - ⚡ {responseTime} {imageSize && `- 📁 ${imageSize}`}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imageUrl ? (
                  <div className="space-y-4">
                    <img src={imageUrl || "/placeholder.svg"} alt="Radar Chart" className="w-full border rounded-lg" />
                    <div className="flex gap-2">
                      <Button onClick={copyImageUrl} className="flex-1">
                        Copiar URL da Imagem
                      </Button>
                      <Badge variant="outline">✅ URL Gerada</Badge>
                    </div>
                    {responseTime && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>⚡ Tempo de resposta: {responseTime}</div>
                        {imageSize && <div>📁 Tamanho da imagem: {imageSize}</div>}
                        <div>
                          🎯 Resolução: {width[0]}x{height[0]}px
                        </div>
                        <div>🎨 Qualidade: {quality[0]}%</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">Configure os dados e clique em "Gerar URL da Imagem"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {rawResponse && (
            <Card>
              <CardHeader>
                <CardTitle>Resposta JSON</CardTitle>
                <CardDescription>Resposta completa da API com a URL da imagem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto max-h-[300px]">{rawResponse}</pre>
                  <Button onClick={copyJsonResponse} variant="outline">
                    Copiar Resposta JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="n8n" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integração com N8N</CardTitle>
              <CardDescription>Como usar esta API com N8N</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Passo 1: Configurar HTTP Request no N8N</h3>
                <div className="bg-muted p-4 rounded">
                  <p className="font-semibold mb-2">Configurações básicas:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      <strong>Método:</strong> POST
                    </li>
                    <li>
                      <strong>URL:</strong>{" "}
                      {origin ? `${origin}/api/radar-chart-url` : "[URL_DO_SEU_SITE]/api/radar-chart-url"}
                    </li>
                    <li>
                      <strong>Headers:</strong> Content-Type: application/json
                    </li>
                    <li>
                      <strong>Response Format:</strong> JSON
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Passo 2: Configurar o Body (JSON)</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  {JSON.stringify(
                    {
                      labels: ["Item 1", "Item 2", "Item 3"],
                      dados: [7, 8, 5],
                      format: "png",
                      options: {
                        width: 800,
                        height: 600,
                        quality: 90,
                        title: "Meu Gráfico Radar",
                      },
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Passo 3: Extrair a URL da Imagem</h3>
                <div className="bg-muted p-4 rounded">
                  <p className="mb-2">
                    Após a requisição, você receberá um JSON com a URL da imagem. Use um <strong>Set</strong> node para
                    extrair a URL:
                  </p>
                  <pre className="bg-gray-800 text-white p-2 rounded">$json["imageUrl"]</pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Passo 4: Usar a URL da Imagem</h3>
                <div className="bg-muted p-4 rounded">
                  <p>Agora você pode usar a URL da imagem em:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Enviar por e-mail</li>
                    <li>Postar em redes sociais</li>
                    <li>Incluir em relatórios</li>
                    <li>Salvar em um banco de dados</li>
                    <li>Exibir em um dashboard</li>
                  </ul>
                </div>
              </div>

              {origin && (
                <Button onClick={copyN8nExample} className="w-full">
                  Copiar Exemplo Completo para N8N
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentação da API</CardTitle>
              <CardDescription>Referência completa da API de URL de imagens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Endpoint</h3>
                <code className="bg-muted p-2 rounded block">POST /api/radar-chart-url</code>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Parâmetros</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left">Parâmetro</th>
                        <th className="border p-2 text-left">Tipo</th>
                        <th className="border p-2 text-left">Obrigatório</th>
                        <th className="border p-2 text-left">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">labels</td>
                        <td className="border p-2">Array de strings</td>
                        <td className="border p-2">Sim</td>
                        <td className="border p-2">Rótulos para cada ponto do gráfico radar</td>
                      </tr>
                      <tr>
                        <td className="border p-2">dados</td>
                        <td className="border p-2">Array de números</td>
                        <td className="border p-2">Sim</td>
                        <td className="border p-2">Valores para cada ponto (0-10)</td>
                      </tr>
                      <tr>
                        <td className="border p-2">format</td>
                        <td className="border p-2">String</td>
                        <td className="border p-2">Não</td>
                        <td className="border p-2">Formato da imagem: "svg", "png", "jpeg", "webp" (padrão: "png")</td>
                      </tr>
                      <tr>
                        <td className="border p-2">options</td>
                        <td className="border p-2">Objeto</td>
                        <td className="border p-2">Não</td>
                        <td className="border p-2">Opções de personalização</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Opções de Personalização</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left">Opção</th>
                        <th className="border p-2 text-left">Tipo</th>
                        <th className="border p-2 text-left">Padrão</th>
                        <th className="border p-2 text-left">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">width</td>
                        <td className="border p-2">Número</td>
                        <td className="border p-2">600</td>
                        <td className="border p-2">Largura da imagem em pixels</td>
                      </tr>
                      <tr>
                        <td className="border p-2">height</td>
                        <td className="border p-2">Número</td>
                        <td className="border p-2">600</td>
                        <td className="border p-2">Altura da imagem em pixels</td>
                      </tr>
                      <tr>
                        <td className="border p-2">quality</td>
                        <td className="border p-2">Número</td>
                        <td className="border p-2">90</td>
                        <td className="border p-2">Qualidade da imagem (1-100)</td>
                      </tr>
                      <tr>
                        <td className="border p-2">density</td>
                        <td className="border p-2">Número</td>
                        <td className="border p-2">150</td>
                        <td className="border p-2">Densidade (DPI) para conversão</td>
                      </tr>
                      <tr>
                        <td className="border p-2">title</td>
                        <td className="border p-2">String</td>
                        <td className="border p-2">"Gráfico Radar"</td>
                        <td className="border p-2">Título do gráfico</td>
                      </tr>
                      <tr>
                        <td className="border p-2">colors</td>
                        <td className="border p-2">Objeto</td>
                        <td className="border p-2">...</td>
                        <td className="border p-2">Cores personalizadas para o gráfico</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resposta</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  {JSON.stringify(
                    {
                      success: true,
                      format: "png",
                      imageUrl: "data:image/png;base64,iVBOR...[base64 encoded data]",
                      size: 12345,
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Exemplo de Requisição</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  {`curl -X POST ${origin || "[URL_DO_SEU_SITE]"}/api/radar-chart-url \\
  -H "Content-Type: application/json" \\
  -d '{
    "labels": ["Item 1", "Item 2", "Item 3"],
    "dados": [7, 8, 5],
    "format": "png",
    "options": {
      "width": 800,
      "height": 600,
      "quality": 90,
      "title": "Meu Gráfico Radar"
    }
  }'`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
