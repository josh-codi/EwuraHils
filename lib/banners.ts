export function isBannerActive(banner: {
  published: boolean
  startsAt: Date | null
  endsAt: Date | null
}): boolean {
  if (!banner.published) return false
  const now = new Date()
  if (banner.startsAt && now < banner.startsAt) return false
  if (banner.endsAt && now > banner.endsAt) return false
  return true
}