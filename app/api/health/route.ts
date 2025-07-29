import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Health check called")

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "API is working",
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    console.error("Health check error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
