"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { recentScansData as initialData } from "@/lib/mock-data"

type Scan = {
  id: string;
  cropType: string;
  disease: string;
  date: string;
  status: string;
  image: string;
  data_ai_hint: string;
};

export function RecentScans() {
  const [scans, setScans] = useState<Scan[] | null>(null);

  useEffect(() => {
    // This code runs only on the client, after hydration.
    const loadScans = () => {
      try {
        const storedScans = localStorage.getItem("recentScans");
        setScans(storedScans ? JSON.parse(storedScans) : initialData);
      } catch (error) {
        console.error("Could not parse recent scans from localStorage", error);
        setScans(initialData);
      }
    }
    
    loadScans();

    window.addEventListener('storage', loadScans);
    return () => window.removeEventListener('storage', loadScans);
  }, []);

  const renderContent = () => {
    if (!scans) {
      return (
        <div className="space-y-2 p-6 pt-0">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    return (
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
          {scans.length > 0 ? (
            scans.map((scan) => (
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No scans have been recorded yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Scans</CardTitle>
        <CardDescription>
          A log of the most recent crop analyses.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {renderContent()}
      </CardContent>
    </Card>
  )
}
