import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">AgroSaviour</CardTitle>
          <CardDescription>AI-Powered Crop Disease Detection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/auth/login" className="block">
            <Button className="w-full" size="lg">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register" className="block">
            <Button variant="outline" className="w-full bg-transparent" size="lg">
              Create Account
            </Button>
          </Link>
          <p className="text-center text-sm text-muted-foreground">Protect your crops with advanced AI technology</p>
        </CardContent>
      </Card>
    </div>
  )
}
