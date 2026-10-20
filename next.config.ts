import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "picsum.photos" },
      // Temporary placeholders hosted on Pinterest (replace with Cloudinary uploads).
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "v1.pinimg.com" },
      { protocol: "https", hostname: "media.pinimg.com" },
    ],
  },
}

export default nextConfig