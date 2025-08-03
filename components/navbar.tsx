"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut, Settings, BarChart3, Search, Home, Leaf } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "./theme-toggle"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Analyze", href: "/analyze", icon: Search },
  { name: "Insights", href: "/insights", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Navbar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      const { signOut } = await import("firebase/auth")
      const { auth } = await import("@/lib/firebase")

      if (!auth) {
        throw new Error("Firebase authentication not available")
      }

      await signOut(auth)
      router.push("/")
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!user) return null

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href="/dashboard" className="flex items-center">
              <Leaf className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">AgroSaviour</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
