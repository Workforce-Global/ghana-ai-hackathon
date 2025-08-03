import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, Cpu } from "lucide-react"
import type { ScanResult } from "@/lib/firestore"

interface ScanCardProps {
  scan: ScanResult
}

export function ScanCard({ scan }: ScanCardProps) {
  const confidenceColor =
    scan.confidence > 0.8 ? "bg-green-500" : scan.confidence > 0.6 ? "bg-yellow-500" : "bg-red-500"

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{scan.label}</CardTitle>
          <Badge className={`${confidenceColor} text-white`}>{(scan.confidence * 100).toFixed(1)}%</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          {scan.timestamp.toDate().toLocaleDateString()}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Target className="h-4 w-4 mr-2" />
          Confidence: {(scan.confidence * 100).toFixed(1)}%
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Cpu className="h-4 w-4 mr-2" />
          Model: {scan.modelUsed}
        </div>
        {scan.recommendations && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">AI Recommendations:</p>
            <p className="text-sm text-muted-foreground line-clamp-3">{scan.recommendations}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
