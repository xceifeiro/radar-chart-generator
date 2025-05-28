import { type NextRequest, NextResponse } from "next/server"

// Esta API aceita tanto GET quanto POST para diagnóstico
export async function GET(request: NextRequest) {
  console.log("GET request recebido em /api/radar-test")

  return NextResponse.json({
    success: true,
    method: "GET",
    message: "API de teste funcionando corretamente com GET",
    timestamp: new Date().toISOString(),
    query: Object.fromEntries(request.nextUrl.searchParams),
    headers: Object.fromEntries(request.headers),
    testImageUrl:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgc3Ryb2tlPSJibHVlIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9InJlZCIgLz48L3N2Zz4=",
  })
}

export async function POST(request: NextRequest) {
  console.log("POST request recebido em /api/radar-test")

  let body = {}
  try {
    body = await request.json()
  } catch (e) {
    console.log("Erro ao parsear JSON do body:", e)
    // Continua mesmo se o body não for JSON válido
  }

  return NextResponse.json({
    success: true,
    method: "POST",
    message: "API de teste funcionando corretamente com POST",
    timestamp: new Date().toISOString(),
    receivedBody: body,
    headers: Object.fromEntries(request.headers),
    testImageUrl:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgc3Ryb2tlPSJibHVlIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9InJlZCIgLz48L3N2Zz4=",
  })
}

// Também vamos permitir PUT e outros métodos para diagnóstico completo
export async function PUT(request: NextRequest) {
  return NextResponse.json({
    success: true,
    method: "PUT",
    message: "API de teste funcionando com PUT",
    timestamp: new Date().toISOString(),
  })
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "X-Test-Header": "API de teste funcionando com HEAD",
    },
  })
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "GET, POST, PUT, HEAD, OPTIONS",
      "Access-Control-Allow-Methods": "GET, POST, PUT, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
