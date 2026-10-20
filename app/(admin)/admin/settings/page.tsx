import { getStoreSettings } from "@/lib/store-settings"
import { StoreSettingsManager } from "@/components/admin/store-settings-manager"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const settings = await getStoreSettings()
  return <StoreSettingsManager settings={settings} />
}