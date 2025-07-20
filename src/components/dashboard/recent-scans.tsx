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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getFirestore, collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/auth-provider"
import { app } from "@/lib/firebase"
import { BrainCircuit, Microscope, Calendar } from "lucide-react"
import { FullAnalysisReport } from "@/ai/flows/run-full-analysis"

interface ReportWithId extends FullAnalysisReport {
  id: string;
  timestamp: Timestamp;
}

export function RecentScans({ showAll = false }: { showAll?: boolean }) {
  const [reports, setReports] = useState<ReportWithId[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchReports = async () => {
    if (!user) {
      setLoading(false);
      return;
    };
    setLoading(true);
    try {
      const db = getFirestore(app);
      const reportsRef = collection(db, "users", user.uid, "reports");
      const q = showAll 
        ? query(reportsRef, orderBy("timestamp", "desc"))
        : query(reportsRef, orderBy("timestamp", "desc"), limit(5));
      
      const querySnapshot = await getDocs(q);
      const fetchedReports = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as FullAnalysisReport), timestamp: doc.data().timestamp } as ReportWithId));
      setReports(fetchedReports);
    } catch (error) {
      console.error("Error fetching reports from Firestore:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
    // Listen for custom event to refetch reports after a new scan is completed
    window.addEventListener('scanCompleted', fetchReports);
    return () => window.removeEventListener('scanCompleted', fetchReports);
  }, [user, showAll]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2 p-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }

    if (!reports || reports.length === 0) {
      return (
        <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
          No scans have been recorded yet.
        </div>
      );
    }

    return (
      <Accordion type="single" collapsible className="w-full">
          {reports.map((report) => (
            <AccordionItem value={report.id} key={report.id}>
              <AccordionTrigger className="hover:no-underline px-6 py-4">
                <div className="flex items-center gap-4 w-full">
                  <Image
                    alt="Crop image"
                    className="aspect-square rounded-md object-cover"
                    height="40"
                    src={report.imageUrl}
                    width="40"
                  />
                  <div className="grid gap-1 text-left sm:w-1/3">
                    <p className="font-medium">{report.prediction.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {(report.prediction.confidence * 100).toFixed(0)}% Confidence
                    </p>
                  </div>
                   <div className="flex-1 text-right sm:text-left">
                     <Badge 
                      variant="outline"
                      className="flex items-center gap-1.5"
                    >
                      {report.modelUsed === 'mobilenet' ? <BrainCircuit className="h-3 w-3" /> : <Microscope className="h-3 w-3" />}
                      {report.modelUsed}
                    </Badge>
                  </div>
                  <p className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(report.timestamp.seconds * 1000).toLocaleDateString()}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 bg-muted/50">
                 <div className="grid md:grid-cols-3 gap-6 pt-4">
                    <div className="md:col-span-1">
                       <Image
                          alt="Crop image"
                          className="aspect-video w-full rounded-md object-cover"
                          height="150"
                          src={report.imageUrl}
                          width="250"
                        />
                    </div>
                    <div className="md:col-span-2 prose prose-sm dark:prose-invert text-card-foreground">
                        <div dangerouslySetInnerHTML={{ __html: report.geminiReport }}></div>
                    </div>
                 </div>
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{showAll ? 'All Scans' : 'Recent Scans'}</CardTitle>
        <CardDescription>
          {showAll 
            ? 'A complete log of all your crop analyses.'
            : 'The 5 most recent crop analyses. Click to see details.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {renderContent()}
      </CardContent>
    </Card>
  )
}
