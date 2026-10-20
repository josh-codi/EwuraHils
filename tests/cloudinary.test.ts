import { describe, it, expect } from "vitest"
import {
  getAllowedFolder,
  validateUploadMeta,
  isCloudinaryConfigured,
  destroyCloudinaryAsset,
  PLACEHOLDER_NAMESPACE,
} from "@/lib/cloudinary"

describe("cloudinary helpers", () => {
  it("scopes uploads to the ewurahils namespace", () => {
    expect(getAllowedFolder("products")).toBe("ewurahils/products")
  })

  it("rejects unknown folders", () => {
    expect(() => getAllowedFolder("secrets")).toThrow()
  })

  it("rejects assets outside the namespace", () => {
    expect(() =>
      validateUploadMeta({
        publicId: "someone-else/photo",
        resourceType: "image",
        url: "https://res.cloudinary.com/demo/image/upload/x.jpg",
      })
    ).toThrow()
  })

  it("rejects non https urls", () => {
    expect(() =>
      validateUploadMeta({
        publicId: "ewurahils/products/x",
        resourceType: "image",
        url: "http://res.cloudinary.com/demo/image/upload/x.jpg",
      })
    ).toThrow()
  })

  it("accepts a valid asset", () => {
    expect(() =>
      validateUploadMeta({
        publicId: "ewurahils/products/x",
        resourceType: "image",
        url: "https://res.cloudinary.com/demo/image/upload/x.jpg",
      })
    ).not.toThrow()
  })

  it("reports when cloudinary is not configured", () => {
    expect(typeof isCloudinaryConfigured()).toBe("boolean")
  })

  it("never tries to delete placeholder assets from cloudinary", async () => {
    const result = await destroyCloudinaryAsset(`${PLACEHOLDER_NAMESPACE}look-01`, "IMAGE")
    expect(result).toBe(false)
  })
})
