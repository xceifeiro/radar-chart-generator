import { type NextRequest, NextResponse } from "next/server"

// Função simplificada para gerar SVG básico
function generateSimpleRadarSVG(labels: string[], dados: number[]): string {
  const size = 400
  const center = size / 2
  const radius = 150
  const numPoints = labels.length

  // Calcular pontos do polígono
  const points = dados.map((value, index) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2
    const r = (value / 10) * radius
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y, value }
  })

  // Calcular pontos dos labels
  const labelPoints = labels.map((label, index) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2
    const r = radius + 30
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y, label, angle }
  })

  const gridLevels = [2, 4, 6, 8, 10]

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="white"/>
  
  <text x="250" y="30" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle" fill="#333">Gráfico Radar</text>
  
  ${gridLevels
    .map((level) => {
      const r = (level / 10) * radius
      return `<circle cx="250" cy="250" r="${r}" stroke="#e0e0e0" stroke-width="1" fill="none" />`
    })
    .join("")}
  
  ${Array.from({ length: numPoints }, (_, index) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2
    const x2 = 250 + radius * Math.cos(angle)
    const y2 = 250 + radius * Math.sin(angle)
    return `<line x1="250" y1="250" x2="${x2}" y2="${y2}" stroke="#ccc" stroke-width="1" />`
  }).join("")}
  
  ${gridLevels
    .map((level) => {
      const r = (level / 10) * radius
      return `<text x="250" y="${250 - r - 5}" font-family="Arial" font-size="10" text-anchor="middle" fill="#666">${level}</text>`
    })
    .join("")}
  
  <polygon points="${points.map((p) => `${p.x + 50},${p.y + 50}`).join(" ")}" 
           fill="rgba(54, 162, 235, 0.2)" 
           stroke="rgba(54, 162, 235, 1)" 
           stroke-width="2" />
  
  ${points.map((p) => `<circle cx="${p.x + 50}" cy="${p.y + 50}" r="4" fill="rgba(54, 162, 235, 1)" stroke="white" stroke-width="2" />`).join("")}
  
  ${labelPoints
    .map((p) => {
      const textAnchor =
        p.angle > -Math.PI / 2 && p.angle < Math.PI / 2
          ? "start"
          : p.angle > Math.PI / 2 || p.angle < -Math.PI / 2
            ? "end"
            : "middle"
      const dx = textAnchor === "start" ? 5 : textAnchor === "end" ? -5 : 0
      const escapedLabel = p.label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

      return `<text x="${p.x + 50 + dx}" y="${p.y + 50}" font-family="Arial" font-size="12" font-weight="bold" text-anchor="${textAnchor}" fill="#333">${escapedLabel}</text>`
    })
    .join("")}
  
  ${points.map((p) => `<text x="${p.x + 50}" y="${p.y + 50 - 10}" font-family="Arial" font-size="10" text-anchor="middle" fill="#666">${p.value}</text>`).join("")}
</svg>`
}

// Esta API aceita tanto GET quanto POST para compatibilidade com N8N
export async function GET(request: NextRequest) {
  console.log("GET request recebido em /api/radar-ultra-simple")

  // Extrair parâmetros da query string
  const labels = request.nextUrl.searchParams.get("labels")
  const dados = request.nextUrl.searchParams.get("dados")

  try {
    // Tentar parsear os parâmetros
    const labelsArray = labels ? JSON.parse(labels) : ["Item 1", "Item 2", "Item 3"]
    const dadosArray = dados ? JSON.parse(dados) : [7, 8, 5]

    // Gerar SVG
    const svgContent = generateSimpleRadarSVG(labelsArray, dadosArray)

    // Converter para base64
    const svgBase64 = Buffer.from(svgContent).toString("base64")
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`

    // Retornar JSON com URL da imagem
    return NextResponse.json({
      success: true,
      method: "GET",
      imageUrl: dataUrl,
      format: "svg",
      size: svgContent.length,
      message: "Gráfico SVG gerado com sucesso via GET",
    })
  } catch (error) {
    console.error("Erro ao processar GET:", error)

    // Em caso de erro, retornar um gráfico padrão
    const defaultLabels = ["Item 1", "Item 2", "Item 3"]
    const defaultDados = [7, 8, 5]
    const svgContent = generateSimpleRadarSVG(defaultLabels, defaultDados)
    const svgBase64 = Buffer.from(svgContent).toString("base64")
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`

    return NextResponse.json({
      success: true,
      method: "GET",
      imageUrl: dataUrl,
      format: "svg",
      size: svgContent.length,
      message: "Gráfico SVG padrão gerado (erro ao processar parâmetros)",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}

export async function POST(request: NextRequest) {
  console.log("POST request recebido em /api/radar-ultra-simple")

  try {
    // Tentar parsear o body
    let body: any = {}
    try {
      body = await request.json()
    } catch (e) {
      console.log("Erro ao parsear JSON do body:", e)
      body = {}
    }

    // Extrair labels e dados do body ou usar valores padrão
    const labels = body.labels || ["Item 1", "Item 2", "Item 3"]
    const dados = body.dados || [7, 8, 5]

    // Gerar SVG
    const svgContent = generateSimpleRadarSVG(labels, dados)

    // Converter para base64
    const svgBase64 = Buffer.from(svgContent).toString("base64")
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`

    // Retornar JSON com URL da imagem
    return NextResponse.json({
      success: true,
      method: "POST",
      imageUrl: dataUrl,
      format: "svg",
      size: svgContent.length,
      message: "Gráfico SVG gerado com sucesso via POST",
    })
  } catch (error) {
    console.error("Erro ao processar POST:", error)

    // Em caso de erro, retornar um gráfico padrão
    const defaultLabels = ["Item 1", "Item 2", "Item 3"]
    const defaultDados = [7, 8, 5]
    const svgContent = generateSimpleRadarSVG(defaultLabels, defaultDados)
    const svgBase64 = Buffer.from(svgContent).toString("base64")
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`

    return NextResponse.json({
      success: true,
      method: "POST",
      imageUrl: dataUrl,
      format: "svg",
      size: svgContent.length,
      message: "Gráfico SVG padrão gerado (erro ao processar body)",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
