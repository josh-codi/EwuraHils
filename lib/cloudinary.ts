import { v2 as cloudinary } from "cloudinary"

export type CloudinaryResourceType = "image" | "video"

export function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

const ALLOWED_FOLDERS = ["products", "banners", "categories", "collections", "store"]

export function getAllowedFolder(folder: string): string {
  if (!ALLOWED_FOLDERS.includes(folder)) {
    throw new Error("Invalid upload folder")
  }
  return `ewurahils/${folder}`
}

export function createUploadSignature(params: {
  folder: string
  resourceType: CloudinaryResourceType
}) {
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary is not configured")
  configureCloudinary()
  const folder = getAllowedFolder(params.folder)
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
    resource_type: params.resourceType,
  }
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string
  )
  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    folder,
    resourceType: params.resourceType,
  }
}

export async function destroyCloudinaryAsset(publicId: string, resourceType: string) {
  if (!isCloudinaryConfigured()) return false
  if (!publicId.startsWith("ewurahils/")) throw new Error("Invalid asset namespace")
  // Placeholder assets (temporary Pinterest media) live outside Cloudinary.
  if (publicId.startsWith(PLACEHOLDER_NAMESPACE)) return false
  configureCloudinary()
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType.toLowerCase(),
    invalidate: true,
  })
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary deletion failed: ${result.result}`)
  }
  return true
}

export const PLACEHOLDER_NAMESPACE = "ewurahils/placeholders/"

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024

export function validateUploadMeta(input: {
  publicId: string
  resourceType: string
  format?: string
  url: string
  width?: number
  height?: number
  duration?: number
}) {
  if (!input.publicId || typeof input.publicId !== "string") throw new Error("Missing public id")
  if (!["image", "video"].includes(input.resourceType)) throw new Error("Invalid resource type")
  if (!input.url || !input.url.startsWith("https://")) throw new Error("Invalid url")
  // ensure publicId belongs to our folder namespace
  if (!input.publicId.startsWith("ewurahils/")) throw new Error("Invalid asset namespace")
}