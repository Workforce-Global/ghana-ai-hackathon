import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { recentScansData } from "@/lib/mock-data"

export function RecentScans() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Scans</CardTitle>
        <CardDescription>
          A log of the most recent crop analyses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Crop</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Disease</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentScansData.map((scan) => (
              <TableRow key={scan.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt="Crop image"
                    className="aspect-square rounded-md object-cover"
                    height="40"
                    src={scan.image}
                    width="40"
                    data-ai-hint={scan.data_ai_hint}
                  />
                </TableCell>
                <TableCell className="font-medium">{scan.cropType}</TableCell>
                <TableCell>
                  <Badge 
                    variant={scan.status === "Healthy" ? "outline" : "destructive"}
                    className={scan.status === "Healthy" ? "text-green-600 border-green-600" : ""}
                  >
                    {scan.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{scan.disease}</TableCell>
                <TableCell className="hidden md:table-cell">{scan.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
