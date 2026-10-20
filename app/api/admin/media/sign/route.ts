import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createUploadSignature } from "@/lib/cloudinary"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"

const schema = z.object({
  folder: z.string(),
  resourceType: z.enum(["image", "video"]),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!rateLimit(`media-sign:${session.user.id}:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  try {
    const body = await req.json()
    const { folder, resourceType } = schema.parse(body)
    const sig = createUploadSignature({ folder, resourceType })
    return NextResponse.json(sig)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}