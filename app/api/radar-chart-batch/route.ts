import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

// Reutilizar a função de geração SVG
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

  return `
    <svg width="${size + 100}" height="${size + 100}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .grid-line { stroke: ${colors.grid}; stroke-width: 1; fill: none; }
          .axis-line { stroke: ${colors.axis}; stroke-width: 1; }
          .data-area { fill: ${colors.primaryFill}; stroke: ${colors.primary}; stroke-width: 2; }
          .data-point { fill: ${colors.primary}; stroke: white; stroke-width: 2; }
          .label-text { font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; text-anchor: middle; dominant-baseline: middle; fill: ${colors.text}; }
          .grid-text { font-family: Arial, sans-serif; font-size: 10px; fill: #666; text-anchor: middle; dominant-baseline: middle; }
          .title-text { font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; text-anchor: middle; dominant-baseline: middle; fill: ${colors.text}; }
        </style>
      </defs>
      
      <rect width="100%" height="100%" fill="${colors.background}"/>
      <text x="${(size + 100) / 2}" y="30" class="title-text">${options.title || "Gráfico Radar"}</text>
      
      ${gridLevels
        .map((level) => {
          const r = (level / 10) * radius
          return `<circle cx="${center + 50}" cy="${center + 50}" r="${r}" class="grid-line" />`
        })
        .join("")}
      
      ${Array.from({ length: numPoints }, (_, index) => {
        const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2
        const x2 = center + 50 + radius * Math.cos(angle)
        const y2 = center + 50 + radius * Math.sin(angle)
        return `<line x1="${center + 50}" y1="${center + 50}" x2="${x2}" y2="${y2}" class="axis-line" />`
      }).join("")}
      
      ${gridLevels
        .map((level) => {
          const r = (level / 10) * radius
          return `<text x="${center + 50}" y="${center + 50 - r - 5}" class="grid-text">${level}</text>`
        })
        .join("")}
      
      <polygon points="${points.map((p) => `${p.x + 50},${p.y + 50}`).join(" ")}" class="data-area" />
      
      ${points.map((p) => `<circle cx="${p.x + 50}" cy="${p.y + 50}" r="4" class="data-point" />`).join("")}
      
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

          return `<text x="${p.x + 50 + dx}" y="${p.y + 50}" class="label-text" text-anchor="${textAnchor}">${p.label}</text>`
        })
        .join("")}
      
      ${points.map((p) => `<text x="${p.x + 50}" y="${p.y + 50 - 10}" class="grid-text">${p.value}</text>`).join("")}
    </svg>
  `
}

// Função para processar múltiplos gráficos
async function processBatchCharts(charts: any[], globalOptions: any = {}): Promise<Buffer[]> {
  const results: Buffer[] = []

  for (const chart of charts) {
    const { labels, dados, options = {} } = chart
    const mergedOptions = { ...globalOptions, ...options }

    // Gerar SVG
    const svgContent = generateRadarChartSVG(labels, dados, mergedOptions)

    // Converter para o formato especificado
    const format = mergedOptions.format || "png"
    let imageBuffer: Buffer

    switch (format.toLowerCase()) {
      case "png":
        imageBuffer = await sharp(Buffer.from(svgContent))
          .png({
            quality: mergedOptions.quality || 90,
            compressionLevel: 6,
            force: true,
          })
          .resize(mergedOptions.width || 600, mergedOptions.height || 600, {
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          })
          .toBuffer()
        break

      case "jpeg":
      case "jpg":
        imageBuffer = await sharp(Buffer.from(svgContent))
          .jpeg({
            quality: mergedOptions.quality || 90,
            progressive: true,
            force: true,
          })
          .resize(mergedOptions.width || 600, mergedOptions.height || 600, {
            fit: "contain",
            background: { r: 255, g: 255, b: 255 },
          })
          .toBuffer()
        break

      default:
        imageBuffer = Buffer.from(svgContent)
    }

    results.push(imageBuffer)
  }

  return results
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { charts, globalOptions = {}, outputFormat = "zip" } = body

    // Validação
    if (!charts || !Array.isArray(charts) || charts.length === 0) {
      return NextResponse.json({ error: "Array de gráficos é obrigatório" }, { status: 400 })
    }

    if (charts.length > 10) {
      return NextResponse.json({ error: "Máximo de 10 gráficos por requisição" }, { status: 400 })
    }

    // Validar cada gráfico
    for (let i = 0; i < charts.length; i++) {
      const chart = charts[i]
      if (!chart.labels || !chart.dados) {
        return NextResponse.json({ error: `Gráfico ${i + 1}: labels e dados são obrigatórios` }, { status: 400 })
      }

      if (!Array.isArray(chart.labels) || !Array.isArray(chart.dados)) {
        return NextResponse.json({ error: `Gráfico ${i + 1}: labels e dados devem ser arrays` }, { status: 400 })
      }

      if (chart.labels.length !== chart.dados.length) {
        return NextResponse.json(
          { error: `Gráfico ${i + 1}: labels e dados devem ter o mesmo tamanho` },
          { status: 400 },
        )
      }
    }

    // Processar gráficos
    const imageBuffers = await processBatchCharts(charts, globalOptions)

    // Se for apenas um gráfico, retornar diretamente
    if (charts.length === 1) {
      const format = globalOptions.format || charts[0].options?.format || "png"
      const contentType = format === "svg" ? "image/svg+xml" : `image/${format}`

      return new NextResponse(imageBuffers[0], {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename=radar-chart.${format}`,
          "Cache-Control": "public, max-age=3600",
        },
      })
    }

    // Para múltiplos gráficos, retornar como JSON com base64
    const results = imageBuffers.map((buffer, index) => ({
      index,
      filename: `radar-chart-${index + 1}.${globalOptions.format || "png"}`,
      data: buffer.toString("base64"),
      size: buffer.length,
    }))

    return NextResponse.json({
      success: true,
      count: results.length,
      totalSize: results.reduce((sum, r) => sum + r.size, 0),
      charts: results,
    })
  } catch (error) {
    console.error("Erro no processamento batch:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API Radar Chart Batch - Processamento em lote",
    endpoint: "/api/radar-chart-batch",
    method: "POST",
    features: ["Processar múltiplos gráficos", "Configurações globais", "Otimização de performance"],
    limits: {
      maxCharts: 10,
      supportedFormats: ["svg", "png", "jpeg", "webp"],
    },
    example: {
      charts: [
        {
          labels: ["Item 1", "Item 2", "Item 3"],
          dados: [7, 8, 5],
          options: { title: "Gráfico 1" },
        },
        {
          labels: ["Item A", "Item B", "Item C"],
          dados: [6, 9, 4],
          options: { title: "Gráfico 2" },
        },
      ],
      globalOptions: {
        format: "png",
        width: 800,
        height: 600,
        quality: 95,
      },
    },
  })
}
