import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]

/**
 * Checks if Cloudflare R2 environment variables are configured.
 */
export function isR2Configured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      process.env.CLOUDFLARE_R2_BUCKET_NAME
  )
}

/**
 * Validates image MIME type and file size before upload.
 */
export function validateImageUpload(
  mimeType: string,
  sizeInBytes: number
): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: "Formato no permitido. Solo se aceptan imágenes PNG, JPEG, WebP, SVG o GIF.",
    }
  }

  if (sizeInBytes > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: "El archivo supera el tamaño máximo permitido de 5MB.",
    }
  }

  return { valid: true }
}

/**
 * Returns an S3 client configured for Cloudflare R2.
 */
function getR2Client(): S3Client {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Credenciales de Cloudflare R2 no configuradas en variables de entorno.")
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

/**
 * Uploads an image file to Cloudflare R2 and returns its public CDN URL.
 */
export async function uploadImageToR2(
  fileBuffer: Uint8Array | Buffer,
  fileName: string,
  mimeType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const validation = validateImageUpload(mimeType, fileBuffer.length)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  if (!isR2Configured()) {
    return {
      success: false,
      error: "Cloudflare R2 no está configurado. Usa una URL externa o Data-URI.",
    }
  }

  try {
    const s3 = getR2Client()
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!
    const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || ""

    const ext = fileName.split(".").pop() || "png"
    const uniqueKey = `images/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueKey,
        Body: fileBuffer,
        ContentType: mimeType,
      })
    )

    const url = publicDomain
      ? `https://${publicDomain}/${uniqueKey}`
      : `https://${bucketName}.${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${uniqueKey}`

    return { success: true, url }
  } catch (err: any) {
    console.error("Error al subir a Cloudflare R2:", err)
    return { success: false, error: err.message || "Error al subir la imagen a Cloudflare R2" }
  }
}
