export const HOMEPAGE_SECTION_TYPES = [
  "hero",
  "featured-categories",
  "new-arrivals",
  "featured-products",
  "selected-collection",
  "promotional-banner",
  "campaign-video",
  "brand-story",
  "social",
] as const

export type HomepageSectionType = (typeof HOMEPAGE_SECTION_TYPES)[number]

export const HOMEPAGE_SECTION_LABELS: Record<HomepageSectionType, string> = {
  hero: "Hero",
  "featured-categories": "Featured categories",
  "new-arrivals": "New arrivals",
  "featured-products": "Featured products",
  "selected-collection": "Selected collection",
  "promotional-banner": "Promotional banner",
  "campaign-video": "Campaign video",
  "brand-story": "Brand story",
  social: "Social links",
}
