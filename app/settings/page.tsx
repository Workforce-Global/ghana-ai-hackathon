"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { ThemeToggle } from "@/components/theme-toggle"
import { deleteUserData } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { User, Lock, Trash2, Palette, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { updateEmail } = await import("firebase/auth")
      await updateEmail(user, email)
      toast({
        title: "Email updated",
        description: "Your email address has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to update email",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { updatePassword } = await import("firebase/auth")
      await updatePassword(user, newPassword)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to update password",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Delete user data from Firestore
      await deleteUserData(user.uid)

      // Delete user account
      const { deleteUser } = await import("firebase/auth")
      await deleteUser(user)

      toast({
        title: "Account deleted",
        description: "Your account and all data have been permanently deleted.",
      })

      router.push("/")
    } catch (error: any) {
      toast({
        title: "Failed to delete account",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences.</p>
          </div>

          <div className="space-y-8">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Settings
                </CardTitle>
                <CardDescription>Update your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" disabled={loading || email === user?.email}>
                    Update Email
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Password Settings
                </CardTitle>
                <CardDescription>Change your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button type="submit" disabled={loading || !newPassword || !confirmPassword}>
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Deleting your account will permanently remove all your data, including scan history and results.
                    This action cannot be undone.
                  </AlertDescription>
                </Alert>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={loading}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data
                        from our servers, including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>All scan results and history</li>
                          <li>AI-generated recommendations</li>
                          <li>Account preferences and settings</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
