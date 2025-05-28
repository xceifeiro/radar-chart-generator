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

export async function POST(request: NextRequest) {
  try {
    console.log("API Simples: Recebendo requisição...")

    const body = await request.json()
    const { labels, dados } = body

    // Validação básica
    if (!labels || !dados || !Array.isArray(labels) || !Array.isArray(dados)) {
      return NextResponse.json({ error: "Labels e dados são obrigatórios e devem ser arrays" }, { status: 400 })
    }

    if (labels.length !== dados.length) {
      return NextResponse.json({ error: "Labels e dados devem ter o mesmo tamanho" }, { status: 400 })
    }

    // Converter dados para números
    const dadosNumericos = dados.map((d) => {
      const num = Number(d)
      return isNaN(num) ? 0 : Math.min(Math.max(num, 0), 10)
    })

    console.log("Gerando SVG simples...")
    const svgContent = generateSimpleRadarSVG(labels, dadosNumericos)

    console.log("SVG gerado com sucesso")
    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": "inline; filename=radar-chart-simple.svg",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Erro na API simples:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API Radar Chart Simples - Apenas SVG",
    endpoint: "/api/radar-chart-simple",
    method: "POST",
    format: "SVG apenas",
    example: {
      labels: ["Item 1", "Item 2", "Item 3"],
      dados: [7, 8, 5],
    },
  })
}
