import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight md:text-6xl">Welcome to Your Dashboard</h1>
        <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
          A modern Next.js frontend starter with Clerk authentication and a beautiful dashboard interface.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRightIcon className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
