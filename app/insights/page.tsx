"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { getUserScans, type ScanResult } from "@/lib/firestore"
import { generateInsightsSummary } from "@/lib/groq"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, BarChart3, PieChartIcon, Brain } from "lucide-react"

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"]

export default function InsightsPage() {
  const { user } = useAuth()
  const [scans, setScans] = useState<ScanResult[]>([])
  const [loading, setLoading] = useState(true)
  const [aiInsights, setAiInsights] = useState<string>("")
  const [insightsLoading, setInsightsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const userScans = await getUserScans(user.uid)
          setScans(userScans)

          if (userScans.length > 0) {
            setInsightsLoading(true)
            const insights = await generateInsightsSummary(userScans)
            setAiInsights(insights)
            setInsightsLoading(false)
          }
        } catch (error) {
          console.error("Error fetching data:", error)
          setInsightsLoading(false)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [user])

  // Process data for charts
  const diseaseFrequency = scans.reduce(
    (acc, scan) => {
      acc[scan.label] = (acc[scan.label] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const barChartData = Object.entries(diseaseFrequency)
    .map(([disease, count]) => ({
      disease: disease.length > 15 ? disease.substring(0, 15) + "..." : disease,
      count,
      fullName: disease,
    }))
    .sort((a, b) => b.count - a.count)

  const pieChartData = Object.entries(diseaseFrequency)
    .map(([disease, count]) => ({
      name: disease.length > 20 ? disease.substring(0, 20) + "..." : disease,
      value: count,
      fullName: disease,
    }))
    .sort((a, b) => b.value - a.value)

  // Monthly scan trends
  const monthlyData = scans.reduce(
    (acc, scan) => {
      const date = scan.timestamp.toDate()
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      acc[monthKey] = (acc[monthKey] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const trendData = Object.entries(monthlyData)
    .map(([month, count]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      scans: count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </div>
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Insights</h1>
            <p className="text-muted-foreground">
              Analyze your crop health patterns and get AI-powered insights from your scan history.
            </p>
          </div>

          {scans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Data Available</h3>
                <p className="text-muted-foreground text-center">
                  Start analyzing crop images to see insights and trends here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI-Generated Insights
                  </CardTitle>
                  <CardDescription>Personalized recommendations based on your scan history</CardDescription>
                </CardHeader>
                <CardContent>
                  {insightsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{aiInsights}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Charts Grid */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Disease Frequency Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Disease Detection Frequency
                    </CardTitle>
                    <CardDescription>Most commonly detected diseases in your crops</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="disease" angle={-45} textAnchor="end" height={80} fontSize={12} />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name, props) => [value, "Detections"]}
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                          />
                          <Bar dataKey="count" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Disease Distribution Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChartIcon className="h-5 w-5 mr-2" />
                      Disease Distribution
                    </CardTitle>
                    <CardDescription>Proportion of different diseases detected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name, props) => [value, "Detections"]}
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Scan Trends */}
              {trendData.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Scan Activity Trends
                    </CardTitle>
                    <CardDescription>Your scanning activity over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="scans" fill="#06b6d4" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Diseases Detected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Object.keys(diseaseFrequency).length}</div>
                    <p className="text-xs text-muted-foreground">Unique disease types</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Most Active Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {trendData.length > 0
                        ? trendData.reduce((max, current) => (current.scans > max.scans ? current : max)).month
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">Highest scan activity</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {scans.length > 0
                        ? ((scans.reduce((sum, scan) => sum + scan.confidence, 0) / scans.length) * 100).toFixed(1) +
                          "%"
                        : "0%"}
                    </div>
                    <p className="text-xs text-muted-foreground">Detection accuracy</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
