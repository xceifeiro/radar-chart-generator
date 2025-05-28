import { type NextRequest, NextResponse } from "next/server"

// Função para gerar SVG (mesma do endpoint anterior)
function generateRadarChartSVG(labels: string[], dados: number[], options: any = {}): string {
  const size = options.size || 400
  const center = size / 2
  const radius = options.radius || 150
  const numPoints = labels.length
  const colors = options.colors || {
    primary: "rgba(54, 162, 235, 1)",
    primaryFill: "rgba(54, 162, 235, 0.2)",
    grid: "#e0e0e0",
    axis: "#ccc",
    text: "#333",
    background: "white",
  }

  // Calcular pontos do polígono
  const points = dados.map((value, index) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2
    const r = (value / 10) * radius
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y, angle, value }
  })

  const gridLevels = [2, 4, 6, 8, 10]
  const labelPoints = labels.map((label, index) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2
    const r = radius + 30
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y, label, angle }
  })

  const svgWidth = size + 100
  const svgHeight = size + 100

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css"><![CDATA[
      .grid-line { stroke: ${colors.grid}; stroke-width: 1; fill: none; }
      .axis-line { stroke: ${colors.axis}; stroke-width: 1; }
      .data-area { fill: ${colors.primaryFill}; stroke: ${colors.primary}; stroke-width: 2; }
      .data-point { fill: ${colors.primary}; stroke: white; stroke-width: 2; }
      .label-text { font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; text-anchor: middle; dominant-baseline: central; fill: ${colors.text}; }
      .grid-text { font-family: Arial, sans-serif; font-size: 10px; fill: #666; text-anchor: middle; dominant-baseline: central; }
      .title-text { font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; text-anchor: middle; dominant-baseline: central; fill: ${colors.text}; }
    ]]></style>
  </defs>
  
  <!-- Fundo -->
  <rect width="100%" height="100%" fill="${colors.background}"/>
  
  <!-- Título -->
  <text x="${svgWidth / 2}" y="30" class="title-text">${options.title || "Gráfico Radar - Avaliação Pessoal"}</text>
  
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
      let textAnchor = "middle"
      let dx = 0

      if (p.angle > -Math.PI / 2 && p.angle < Math.PI / 2) {
        textAnchor = "start"
        dx = 5
      } else if (p.angle > Math.PI / 2 || p.angle < -Math.PI / 2) {
        textAnchor = "end"
        dx = -5
      }

      const escapedLabel = p.label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

      return `<text x="${p.x + 50 + dx}" y="${p.y + 50}" class="label-text" text-anchor="${textAnchor}">${escapedLabel}</text>`
    })
    .join("")}
  
  <!-- Valores nos pontos -->
  ${points.map((p) => `<text x="${p.x + 50}" y="${p.y + 50 - 10}" class="grid-text">${p.value}</text>`).join("")}
</svg>`

  return svgContent
}

async function convertSVGtoPNGLocal(svgContent: string, options: any = {}): Promise<Buffer> {
  try {
    const sharp = await import("sharp")
    const width = options.width || 600
    const height = options.height || 600
    const quality = Math.min(Math.max(options.quality || 90, 1), 100)
    const density = Math.min(Math.max(options.density || 150, 72), 600)

    const pngBuffer = await sharp
      .default(Buffer.from(svgContent, "utf-8"), {
        density: density,
      })
      .resize(width, height, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        withoutEnlargement: false,
      })
      .png({
        quality: quality,
        compressionLevel: 6,
        adaptiveFiltering: true,
        force: true,
      })
      .toBuffer()

    return pngBuffer
  } catch (error) {
    console.error("Erro na conversão SVG para PNG:", error)
    throw new Error(`Falha na conversão SVG para PNG: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { labels, dados, options = {}, format = "png" } = body

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

    const invalidData = dados.some((valor) => {
      const num = Number(valor)
      return isNaN(num) || num < 0 || num > 10
    })

    if (invalidData) {
      return NextResponse.json({ error: "Todos os dados devem ser números entre 0 e 10" }, { status: 400 })
    }

    // Gerar SVG com opções personalizadas
    const svgContent = generateRadarChartSVG(labels, dados, options)

    // Se formato for SVG, retornar diretamente
    if (format === "svg") {
      return new NextResponse(svgContent, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": "inline; filename=radar-chart.svg",
          "Cache-Control": "no-cache",
        },
      })
    }

    // Converter para PNG usando Sharp local
    try {
      const imageBuffer = await convertSVGtoPNGLocal(svgContent, options)

      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": "inline; filename=radar-chart.png",
          "Cache-Control": "no-cache",
        },
      })
    } catch (error) {
      console.error("Falha na conversão local:", error)
      // Fallback para SVG
      return new NextResponse(svgContent, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": "inline; filename=radar-chart.svg",
          "Cache-Control": "no-cache",
          "X-Fallback": "true",
        },
      })
    }
  } catch (error) {
    console.error("Erro ao gerar imagem:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API Radar Chart PNG Avançada - Use POST para gerar imagem",
    endpoint: "/api/radar-chart-png-advanced",
    method: "POST",
    formats: ["png", "svg"],
    features: [
      "Conversão SVG para PNG usando Sharp local",
      "Personalização de cores e tamanhos",
      "Fallback automático para SVG",
      "Configurações avançadas de qualidade",
    ],
    example: {
      labels: ["Item 1", "Item 2", "Item 3"],
      dados: [7, 8, 5],
      format: "png",
      options: {
        size: 400,
        radius: 150,
        width: 600,
        height: 600,
        quality: 90,
        title: "Meu Gráfico Personalizado",
        colors: {
          primary: "rgba(255, 99, 132, 1)",
          primaryFill: "rgba(255, 99, 132, 0.2)",
          grid: "#e0e0e0",
          axis: "#ccc",
          text: "#333",
          background: "white",
        },
      },
    },
    note: "Conversão local usando Sharp - sem dependências externas",
  })
}
