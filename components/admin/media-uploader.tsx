"use client"

import { useState } from "react"
import { saveMediaAsset } from "@/server/actions/media"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Asset = { id: string; url: string; resourceType: string }

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024

export function MediaUploader({
  folder,
  onUploaded,
}: {
  folder: string
  onUploaded: (asset: Asset) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  async function upload() {
    if (!file) return
    setError(null)
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("File is larger than 25 MB.")
      return
    }
    const isVideo = file.type.startsWith("video/")
    const isImage = file.type.startsWith("image/")
    if (!isVideo && !isImage) {
      setError("Only image and video uploads are supported.")
      return
    }
    setUploading(true)
    setProgress(0)
    try {
      const resourceType = isVideo ? "video" : "image"
      const sigRes = await fetch("/api/admin/media/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, resourceType }),
      })
      if (!sigRes.ok) throw new Error("Failed to get upload signature")
      const sig = await sigRes.json()

      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", sig.apiKey)
      formData.append("timestamp", String(sig.timestamp))
      formData.append("signature", sig.signature)
      formData.append("folder", sig.folder)

      const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`
      const xhr = new XMLHttpRequest()
      const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText))
          else reject(new Error(xhr.responseText))
        }
        xhr.onerror = () => reject(new Error("Upload failed"))
        xhr.open("POST", url)
        xhr.send(formData)
      })

      const asset = await saveMediaAsset({
        publicId: String(result.public_id),
        resourceType: resourceType === "video" ? "VIDEO" : "IMAGE",
        format: result.format ? String(result.format) : null,
        url: String(result.secure_url),
        width: result.width ? Number(result.width) : null,
        height: result.height ? Number(result.height) : null,
        duration: result.duration ? Number(result.duration) : null,
        altText: null,
        posterPublicId: null,
      })
      onUploaded({ id: asset.id, url: asset.url, resourceType: asset.resourceType })
      setFile(null)
      setProgress(0)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2 rounded border border-border p-3">
      <Label>Upload media</Label>
      <Input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
      {progress > 0 && uploading && <p className="text-xs">Uploading {progress}%</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button onClick={upload} disabled={!file || uploading} size="sm">
        {uploading ? "Uploading…" : "Upload"}
      </Button>
    </div>
  )
}