"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { ScanCard } from "@/components/scan-card"
import { getUserScans, type ScanResult } from "@/lib/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Search, TrendingUp, Activity } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [scans, setScans] = useState<ScanResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScans = async () => {
      if (user) {
        try {
          const userScans = await getUserScans(user.uid)
          setScans(userScans)
        } catch (error) {
          console.error("Error fetching scans:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchScans()
  }, [user])

  const totalScans = scans.length
  const recentScans = scans.slice(0, 5)
  const avgConfidence = scans.length > 0 ? scans.reduce((sum, scan) => sum + scan.confidence, 0) / scans.length : 0

  const diseaseFrequency = scans.reduce(
    (acc, scan) => {
      acc[scan.label] = (acc[scan.label] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const mostCommonDisease = Object.entries(diseaseFrequency).sort(([, a], [, b]) => b - a)[0]?.[0] || "None"

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your crop analysis activity.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalScans}</div>
                <p className="text-xs text-muted-foreground">Crop images analyzed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(avgConfidence * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Detection accuracy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Common</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">{mostCommonDisease}</div>
                <p className="text-xs text-muted-foreground">Detected disease</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    scans.filter((scan) => {
                      const scanDate = scan.timestamp.toDate()
                      const now = new Date()
                      return scanDate.getMonth() === now.getMonth() && scanDate.getFullYear() === now.getFullYear()
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Recent scans</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Scans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Scans
                <Badge variant="secondary">{recentScans.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : recentScans.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentScans.map((scan) => (
                    <ScanCard key={scan.id} scan={scan} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No scans yet</h3>
                  <p className="text-muted-foreground">
                    Start by analyzing your first crop image in the Analyze section.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
