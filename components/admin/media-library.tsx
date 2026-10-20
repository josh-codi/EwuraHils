"use client"


import { useRouter } from "next/navigation"
import { deleteMediaAsset } from "@/server/actions/media"
import { MediaUploader } from "@/components/admin/media-uploader"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Asset = { id: string; publicId: string; resourceType: string; url: string; altText: string | null }

export function MediaLibrary({ assets }: { assets: Asset[] }) {
  const router = useRouter()
  async function remove(id: string) {
    if (!confirm("Delete asset?")) return
    try {
      await deleteMediaAsset(id)
      toast.success("Asset deleted.")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl">Media library</h1>
      <MediaUploader folder="products" onUploaded={() => router.refresh()} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {assets.map((a) => (
          <div key={a.id} className="space-y-2">
            {a.resourceType === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.url} alt={a.altText ?? ""} className="aspect-square w-full rounded object-cover" />
            ) : (
              <video src={a.url} className="aspect-square w-full rounded object-cover" />
            )}
            <p className="truncate text-xs text-muted-foreground">{a.publicId}</p>
            <Button size="sm" variant="destructive" className="w-full" onClick={() => remove(a.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}