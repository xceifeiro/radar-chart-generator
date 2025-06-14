import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { labels, dados } = body

    // Validação dos dados
    if (!labels || !dados) {
      return NextResponse.json({ error: "Labels e dados são obrigatórios" }, { status: 400 })
    }

    if (!Array.isArray(labels) || !Array.isArray(dados)) {
      return NextResponse.json({ error: "Labels e dados devem ser arrays" }, { status: 400 })
    }

    if (labels.length !== dados.length) {
      return NextResponse.json({ error: "Labels e dados devem ter o mesmo tamanho" }, { status: 400 })
    }

    // Validação dos valores (0-10)
    const invalidData = dados.some((valor) => {
      const num = Number(valor)
      return isNaN(num) || num < 0 || num > 10
    })

    if (invalidData) {
      return NextResponse.json({ error: "Todos os dados devem ser números entre 0 e 10" }, { status: 400 })
    }

    // Gerar SVG do gráfico radar
    const svgContent = generateRadarChartSVG(labels, dados)

    // Converter SVG para PNG usando uma API externa ou retornar SVG
    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": "inline; filename=radar-chart.svg",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Erro ao gerar imagem:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

function generateRadarChartSVG(labels: string[], dados: number[]): string {
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
    return { x, y, angle, value }
  })

  // Calcular pontos das linhas de grade
  const gridLevels = [2, 4, 6, 8, 10]
  const gridLines = gridLevels.map((level) => {
    return Array.from({ length: numPoints }, (_, index) => {
      const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2
      const r = (level / 10) * radius
      const x = center + r * Math.cos(angle)
      const y = center + r * Math.sin(angle)
      return { x, y }
    })
  })

  // Calcular pontos dos labels
  const labelPoints = labels.map((label, index) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2
    const r = radius + 30
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y, label, angle }
  })

  const svgContent = `
    <svg width="${size + 100}" height="${size + 100}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .grid-line { stroke: #e0e0e0; stroke-width: 1; fill: none; }
          .axis-line { stroke: #ccc; stroke-width: 1; }
          .data-area { fill: rgba(54, 162, 235, 0.2); stroke: rgba(54, 162, 235, 1); stroke-width: 2; }
          .data-point { fill: rgba(54, 162, 235, 1); stroke: white; stroke-width: 2; }
          .label-text { font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; text-anchor: middle; dominant-baseline: middle; }
          .grid-text { font-family: Arial, sans-serif; font-size: 10px; fill: #666; text-anchor: middle; dominant-baseline: middle; }
          .title-text { font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; text-anchor: middle; dominant-baseline: middle; }
        </style>
      </defs>
      
      <!-- Título -->
      <text x="${(size + 100) / 2}" y="30" class="title-text">Gráfico Radar - Avaliação Pessoal</text>
      
      <!-- Linhas de grade circulares -->
      ${gridLevels
        .map((level) => {
          const r = (level / 10) * radius
          return `<circle cx="${center + 50}" cy="${center + 50}" r="${r}" class="grid-line" />`
        })
        .join("")}
      
      <!-- Linhas de grade radiais -->
      ${Array.from({ length: numPoints }, (_, index) => {
        const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2
        const x2 = center + 50 + radius * Math.cos(angle)
        const y2 = center + 50 + radius * Math.sin(angle)
        return `<line x1="${center + 50}" y1="${center + 50}" x2="${x2}" y2="${y2}" class="axis-line" />`
      }).join("")}
      
      <!-- Números da escala -->
      ${gridLevels
        .map((level) => {
          const r = (level / 10) * radius
          return `<text x="${center + 50}" y="${center + 50 - r - 5}" class="grid-text">${level}</text>`
        })
        .join("")}
      
      <!-- Área de dados -->
      <polygon points="${points.map((p) => `${p.x + 50},${p.y + 50}`).join(" ")}" class="data-area" />
      
      <!-- Pontos de dados -->
      ${points.map((p) => `<circle cx="${p.x + 50}" cy="${p.y + 50}" r="4" class="data-point" />`).join("")}
      
      <!-- Labels -->
      ${labelPoints
        .map((p) => {
          // Ajustar posição do texto baseado no ângulo
          let textAnchor = "middle"
          let dx = 0
          const dy = 0

          if (p.angle > -Math.PI / 2 && p.angle < Math.PI / 2) {
            textAnchor = "start"
            dx = 5
          } else if (p.angle > Math.PI / 2 || p.angle < -Math.PI / 2) {
            textAnchor = "end"
            dx = -5
          }

          return `<text x="${p.x + 50 + dx}" y="${p.y + 50 + dy}" class="label-text" text-anchor="${textAnchor}">${p.label}</text>`
        })
        .join("")}
      
      <!-- Valores nos pontos -->
      ${points.map((p) => `<text x="${p.x + 50}" y="${p.y + 50 - 10}" class="grid-text">${p.value}</text>`).join("")}
    </svg>
  `

  return svgContent
}

export async function GET() {
  return NextResponse.json({
    message: "API Radar Chart Image - Use POST para gerar imagem SVG",
    endpoint: "/api/radar-chart-image",
    method: "POST",
    format: "SVG",
    example: {
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
    },
  })
}
