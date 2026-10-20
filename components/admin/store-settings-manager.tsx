"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateStoreSettings } from "@/server/actions/store-settings"
import { MediaUploader } from "@/components/admin/media-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Settings = Record<string, unknown>

export function StoreSettingsManager({ settings }: { settings: Settings | null }) {
  const router = useRouter()
  const s = settings ?? {}
  const [storeName, setStoreName] = useState(String(s.storeName ?? ""))
  const [brandDescription, setBrandDescription] = useState(String(s.brandDescription ?? ""))
  const [address, setAddress] = useState(String(s.address ?? ""))
  const [openingHours, setOpeningHours] = useState(String(s.openingHours ?? ""))
  const [whatsappNumber, setWhatsappNumber] = useState(String(s.whatsappNumber ?? ""))
  const [phone, setPhone] = useState(String(s.phone ?? ""))
  const [email, setEmail] = useState(String(s.email ?? ""))
  const [instagram, setInstagram] = useState(String(s.instagram ?? ""))
  const [tiktok, setTiktok] = useState(String(s.tiktok ?? ""))
  const [facebook, setFacebook] = useState(String(s.facebook ?? ""))
  const [announcementText, setAnnouncementText] = useState(String(s.announcementText ?? ""))
  const [announcementVisible, setAnnouncementVisible] = useState(Boolean(s.announcementVisible))
  const [footerContent, setFooterContent] = useState(String(s.footerContent ?? ""))
  const [aboutContent, setAboutContent] = useState(String(s.aboutContent ?? ""))
  const [shippingPolicy, setShippingPolicy] = useState(String(s.shippingPolicy ?? ""))
  const [returnsPolicy, setReturnsPolicy] = useState(String(s.returnsPolicy ?? ""))
  const [customerServiceInfo, setCustomerServiceInfo] = useState(String(s.customerServiceInfo ?? ""))
  const [seoTitle, setSeoTitle] = useState(String(s.seoTitle ?? ""))
  const [seoDescription, setSeoDescription] = useState(String(s.seoDescription ?? ""))
  const [logoMediaId, setLogoMediaId] = useState<string | null>(s.logoMediaId ? String(s.logoMediaId) : null)
  const [faviconMediaId, setFaviconMediaId] = useState<string | null>(s.faviconMediaId ? String(s.faviconMediaId) : null)
  const [socialImageMediaId, setSocialImageMediaId] = useState<string | null>(s.defaultSocialImageMediaId ? String(s.defaultSocialImageMediaId) : null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setMessage(null)
    try {
      await updateStoreSettings({
        storeName,
        brandDescription: brandDescription || null,
        address: address || null,
        openingHours: openingHours || null,
        whatsappNumber: whatsappNumber || null,
        phone: phone || null,
        email: email || null,
        instagram: instagram || null,
        tiktok: tiktok || null,
        facebook: facebook || null,
        announcementText: announcementText || null,
        announcementVisible,
        footerContent: footerContent || null,
        aboutContent: aboutContent || null,
        shippingPolicy: shippingPolicy || null,
        returnsPolicy: returnsPolicy || null,
        customerServiceInfo: customerServiceInfo || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        logoMediaId,
        faviconMediaId,
        defaultSocialImageMediaId: socialImageMediaId,
      })
      setMessage("Settings saved.")
      router.refresh()
    } catch (e) {
      setMessage((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Store settings</h1>
      <section className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-medium">Brand</h2>
        <div>
          <Label>Store name</Label>
          <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </div>
        <div>
          <Label>Brand description</Label>
          <Textarea value={brandDescription} onChange={(e) => setBrandDescription(e.target.value)} />
        </div>
        <div>
          <Label>Logo</Label>
          <MediaUploader folder="store" onUploaded={(a) => setLogoMediaId(a.id)} />
          {logoMediaId && <p className="text-xs text-muted-foreground">Logo set</p>}
        </div>
        <div>
          <Label>Favicon</Label>
          <MediaUploader folder="store" onUploaded={(a) => setFaviconMediaId(a.id)} />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-medium">Contact</h2>
        <div>
          <Label>WhatsApp number (international)</Label>
          <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="233..." />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Address</Label>
          <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <Label>Opening hours</Label>
          <Textarea value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-medium">Social links</h2>
        <div>
          <Label>Instagram</Label>
          <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        </div>
        <div>
          <Label>TikTok</Label>
          <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
        </div>
        <div>
          <Label>Facebook</Label>
          <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-medium">Content</h2>
        <div>
          <Label>Announcement text</Label>
          <Input value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={announcementVisible} onChange={(e) => setAnnouncementVisible(e.target.checked)} />
          Show announcement bar
        </label>
        <div>
          <Label>Footer content</Label>
          <Textarea value={footerContent} onChange={(e) => setFooterContent(e.target.value)} />
        </div>
        <div>
          <Label>About content</Label>
          <Textarea value={aboutContent} onChange={(e) => setAboutContent(e.target.value)} />
        </div>
        <div>
          <Label>Shipping policy</Label>
          <Textarea value={shippingPolicy} onChange={(e) => setShippingPolicy(e.target.value)} />
        </div>
        <div>
          <Label>Returns policy</Label>
          <Textarea value={returnsPolicy} onChange={(e) => setReturnsPolicy(e.target.value)} />
        </div>
        <div>
          <Label>Customer service info</Label>
          <Textarea value={customerServiceInfo} onChange={(e) => setCustomerServiceInfo(e.target.value)} />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-medium">SEO defaults</h2>
        <div>
          <Label>Site title</Label>
          <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </div>
        <div>
          <Label>Meta description</Label>
          <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
        </div>
        <div>
          <Label>Default social image</Label>
          <MediaUploader folder="store" onUploaded={(a) => setSocialImageMediaId(a.id)} />
        </div>
      </section>

      <div className="flex items-center gap-4">
        <Button onClick={save} disabled={saving} size="lg">
          {saving ? "Saving…" : "Save settings"}
        </Button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}