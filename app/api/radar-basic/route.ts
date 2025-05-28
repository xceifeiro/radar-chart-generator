import { type NextRequest, NextResponse } from "next/server"

// Função para gerar SVG básico sem dependências
function generateBasicRadarSVG(labels: string[], dados: number[]): string {
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
    return { x, y, label }
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
    .map((p, index) => {
      const escapedLabel = p.label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      return `<text x="${p.x + 50}" y="${p.y + 50}" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" fill="#333">${escapedLabel}</text>`
    })
    .join("")}
  
  ${points.map((p) => `<text x="${p.x + 50}" y="${p.y + 50 - 10}" font-family="Arial" font-size="10" text-anchor="middle" fill="#666">${p.value}</text>`).join("")}
</svg>`
}

export async function GET(request: NextRequest) {
  try {
    console.log("GET request recebido em /api/radar-basic")

    // Extrair parâmetros da query string
    const labels = request.nextUrl.searchParams.get("labels")
    const dados = request.nextUrl.searchParams.get("dados")

    // Usar valores padrão se não fornecidos
    let labelsArray = ["Item 1", "Item 2", "Item 3"]
    let dadosArray = [7, 8, 5]

    try {
      if (labels) labelsArray = JSON.parse(labels)
      if (dados) dadosArray = JSON.parse(dados)
    } catch (e) {
      console.log("Erro ao parsear parâmetros, usando valores padrão")
    }

    // Gerar SVG
    const svgContent = generateBasicRadarSVG(labelsArray, dadosArray)

    // Converter para base64
    const svgBase64 = Buffer.from(svgContent).toString("base64")
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`

    // Retornar JSON com URL da imagem
    return NextResponse.json({
      success: true,
      method: "GET",
      imageUrl: dataUrl,
      format: "svg",
      message: "Gráfico SVG gerado com sucesso via GET",
    })
  } catch (error) {
    console.error("Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST request recebido em /api/radar-basic")

    let body: any = {}
    try {
      body = await request.json()
    } catch (e) {
      console.log("Erro ao parsear JSON do body, usando valores padrão")
    }

    // Extrair labels e dados do body ou usar valores padrão
    const labels = body.labels || ["Item 1", "Item 2", "Item 3"]
    const dados = body.dados || [7, 8, 5]

    // Gerar SVG
    const svgContent = generateBasicRadarSVG(labels, dados)

    // Converter para base64
    const svgBase64 = Buffer.from(svgContent).toString("base64")
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`

    // Retornar JSON com URL da imagem
    return NextResponse.json({
      success: true,
      method: "POST",
      imageUrl: dataUrl,
      format: "svg",
      message: "Gráfico SVG gerado com sucesso via POST",
    })
  } catch (error) {
    console.error("Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
