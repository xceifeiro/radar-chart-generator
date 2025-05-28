import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

// Função para gerar o SVG (reutilizada do endpoint anterior)
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

  // SVG com encoding correto e dimensões fixas
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

      // Escapar caracteres especiais no texto
      const escapedLabel = p.label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

      return `<text x="${p.x + 50 + dx}" y="${p.y + 50}" class="label-text" text-anchor="${textAnchor}">${escapedLabel}</text>`
    })
    .join("")}
  
  <!-- Valores nos pontos -->
  ${points.map((p) => `<text x="${p.x + 50}" y="${p.y + 50 - 10}" class="grid-text">${p.value}</text>`).join("")}
</svg>`

  return svgContent
}

// Função para converter SVG para PNG usando Sharp
async function convertSVGtoPNGLocal(svgContent: string, options: any = {}): Promise<Buffer> {
  try {
    const width = options.width || 600
    const height = options.height || 600
    const quality = Math.min(Math.max(options.quality || 90, 1), 100)
    const density = Math.min(Math.max(options.density || 150, 72), 600)

    // Converter SVG para PNG usando Sharp
    const pngBuffer = await sharp(Buffer.from(svgContent, "utf-8"), {
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

// Função para converter SVG para JPEG usando Sharp
async function convertSVGtoJPEGLocal(svgContent: string, options: any = {}): Promise<Buffer> {
  try {
    const width = options.width || 600
    const height = options.height || 600
    const quality = Math.min(Math.max(options.quality || 90, 1), 100)
    const density = Math.min(Math.max(options.density || 150, 72), 600)

    const jpegBuffer = await sharp(Buffer.from(svgContent, "utf-8"), {
      density: density,
    })
      .resize(width, height, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255 },
        withoutEnlargement: false,
      })
      .jpeg({
        quality: quality,
        progressive: true,
        force: true,
      })
      .toBuffer()

    return jpegBuffer
  } catch (error) {
    console.error("Erro na conversão SVG para JPEG:", error)
    throw new Error(`Falha na conversão SVG para JPEG: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
  }
}

// Função para converter SVG para WebP usando Sharp
async function convertSVGtoWebPLocal(svgContent: string, options: any = {}): Promise<Buffer> {
  try {
    const width = options.width || 600
    const height = options.height || 600
    const quality = Math.min(Math.max(options.quality || 90, 1), 100)
    const density = Math.min(Math.max(options.density || 150, 72), 600)

    const webpBuffer = await sharp(Buffer.from(svgContent, "utf-8"), {
      density: density,
    })
      .resize(width, height, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        withoutEnlargement: false,
      })
      .webp({
        quality: quality,
        effort: 6,
        force: true,
      })
      .toBuffer()

    return webpBuffer
  } catch (error) {
    console.error("Erro na conversão SVG para WebP:", error)
    throw new Error(`Falha na conversão SVG para WebP: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Recebendo requisição para gerar URL do gráfico radar...")

    const body = await request.json()
    const { labels, dados, options = {}, format = "png" } = body

    console.log("Dados recebidos:", { labels: labels?.length, dados: dados?.length, format })

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

    // Converter dados para números e validar
    const dadosNumericos = dados.map((valor) => {
      const num = Number(valor)
      if (isNaN(num) || num < 0 || num > 10) {
        throw new Error(`Valor inválido: ${valor}. Todos os dados devem ser números entre 0 e 10`)
      }
      return num
    })

    // Validar formato
    const supportedFormats = ["svg", "png", "jpeg", "jpg", "webp"]
    if (!supportedFormats.includes(format.toLowerCase())) {
      return NextResponse.json({ error: `Formato não suportado. Use: ${supportedFormats.join(", ")}` }, { status: 400 })
    }

    console.log("Gerando SVG...")
    // Gerar SVG
    const svgContent = generateRadarChartSVG(labels, dadosNumericos, options)

    // Se formato for SVG, retornar data URL diretamente
    if (format.toLowerCase() === "svg") {
      console.log("Retornando URL do SVG")
      const svgBase64 = Buffer.from(svgContent).toString("base64")
      const dataUrl = `data:image/svg+xml;base64,${svgBase64}`

      return NextResponse.json({
        success: true,
        format: "svg",
        imageUrl: dataUrl,
        size: svgContent.length,
      })
    }

    console.log("Convertendo para", format.toUpperCase())
    // Converter para o formato solicitado usando Sharp
    let imageBuffer: Buffer
    let contentType: string
    let formatExtension: string

    switch (format.toLowerCase()) {
      case "png":
        imageBuffer = await convertSVGtoPNGLocal(svgContent, options)
        contentType = "image/png"
        formatExtension = "png"
        break

      case "jpeg":
      case "jpg":
        imageBuffer = await convertSVGtoJPEGLocal(svgContent, options)
        contentType = "image/jpeg"
        formatExtension = "jpg"
        break

      case "webp":
        imageBuffer = await convertSVGtoWebPLocal(svgContent, options)
        contentType = "image/webp"
        formatExtension = "webp"
        break

      default:
        throw new Error("Formato não implementado")
    }

    console.log("Conversão concluída. Gerando data URL...")

    // Converter para base64 e criar data URL
    const base64 = imageBuffer.toString("base64")
    const dataUrl = `data:${contentType};base64,${base64}`

    // Retornar JSON com a URL da imagem
    return NextResponse.json({
      success: true,
      format: formatExtension,
      imageUrl: dataUrl,
      size: imageBuffer.length,
    })
  } catch (error) {
    console.error("Erro ao gerar URL da imagem:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API Radar Chart URL - Retorna URL da imagem",
    endpoint: "/api/radar-chart-url",
    method: "POST",
    formats: ["svg", "png", "jpeg", "jpg", "webp"],
    features: [
      "Retorna URL da imagem em vez da imagem diretamente",
      "Ideal para integração com ferramentas como N8N",
      "Suporte a múltiplos formatos de imagem",
      "Personalização completa de qualidade e tamanho",
    ],
    example: {
      labels: ["Item 1", "Item 2", "Item 3"],
      dados: [7, 8, 5],
      format: "png",
      options: {
        size: 400,
        radius: 150,
        width: 800,
        height: 600,
        quality: 95,
        density: 150,
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
    response: {
      success: true,
      format: "png",
      imageUrl: "data:image/png;base64,iVBOR...[base64 encoded data]",
      size: 12345,
    },
  })
}
