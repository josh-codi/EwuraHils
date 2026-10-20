import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-heading text-4xl">Page not found</h1>
      <p className="mt-3 text-muted-foreground">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-6 inline-block underline">
        Go home
      </Link>
    </div>
  )
}