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

    // Formatar dados para o gráfico
    const chartData = labels.map((label: string, index: number) => ({
      subject: label,
      value: Number(dados[index]),
      fullMark: 10,
    }))

    return NextResponse.json({
      success: true,
      data: chartData,
      metadata: {
        totalItems: labels.length,
        maxValue: 10,
        minValue: 0,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API Radar Chart - Use POST para enviar dados",
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
