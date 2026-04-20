"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginRouteAlias() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin")
  }, [router])

  return (
    <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to admin login...</p>
    </div>
  )
}
