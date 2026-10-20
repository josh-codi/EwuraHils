import { getStoreSettings } from "@/lib/store-settings"
import { normalizeWhatsAppNumber } from "@/lib/whatsapp"
import { MessageCircle } from "lucide-react"

export async function WhatsAppFab() {
  const settings = await getStoreSettings()
  const number = normalizeWhatsAppNumber(settings?.whatsappNumber)
  if (!number) return null
  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent("Hello! I have a question about your store.")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  )
}