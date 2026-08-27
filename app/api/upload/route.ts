import { NextRequest, NextResponse } from "next/server"
import { uploadImageToR2, validateImageUpload, isR2Configured } from "@/lib/storage/r2"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión para subir imágenes." },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se proporcionó ningún archivo." },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const validation = validateImageUpload(file.type, buffer.length)
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    // If Cloudflare R2 is configured, upload to R2
    if (isR2Configured()) {
      const uploadRes = await uploadImageToR2(buffer, file.name, file.type)
      if (!uploadRes.success) {
        return NextResponse.json({ success: false, error: uploadRes.error }, { status: 500 })
      }
      return NextResponse.json({ success: true, url: uploadRes.url })
    }

    // Fallback: Convert to Base64 Data-URI if R2 is not set up in environment
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      success: true,
      url: dataUrl,
      isFallbackDataUri: true,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Error al procesar la subida." },
      { status: 500 }
    )
  }
}
