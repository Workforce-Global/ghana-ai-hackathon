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
import { recentScansData as initialData } from "@/lib/mock-data"
import { CheckCircle, AlertCircle, ShieldCheck, ListChecks } from "lucide-react"

type Scan = {
  id: string;
  cropType: string;
  disease: string;
  date: string;
  status: string;
  image: string;
  data_ai_hint: string;
  recommendedActions: string[];
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
        <div className="space-y-2 p-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }

    return (
      <Accordion type="single" collapsible className="w-full">
          {scans.length > 0 ? (
            scans.map((scan) => (
              <AccordionItem value={scan.id} key={scan.id}>
                <AccordionTrigger className="hover:no-underline px-6 py-4">
                  <div className="flex items-center gap-4 w-full">
                    <Image
                      alt="Crop image"
                      className="aspect-square rounded-md object-cover"
                      height="40"
                      src={scan.image}
                      width="40"
                      data-ai-hint={scan.data_ai_hint}
                    />
                    <div className="grid gap-1 text-left sm:w-1/3">
                      <p className="font-medium">{scan.cropType}</p>
                      <p className="text-sm text-muted-foreground">{scan.disease}</p>
                    </div>
                     <div className="flex-1 text-right sm:text-left">
                       <Badge 
                        variant={scan.status === "Healthy" ? "outline" : "destructive"}
                        className={scan.status === "Healthy" ? "text-green-600 border-green-600" : ""}
                      >
                        {scan.status}
                      </Badge>
                    </div>
                    <p className="hidden md:block text-sm text-muted-foreground">{scan.date}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 bg-muted/50">
                   <div className="grid md:grid-cols-3 gap-6 pt-4">
                      <div className="md:col-span-1">
                         <Image
                            alt="Crop image"
                            className="aspect-video w-full rounded-md object-cover"
                            height="150"
                            src={scan.image}
                            width="250"
                            data-ai-hint={scan.data_ai_hint}
                          />
                      </div>
                      <div className="md:col-span-2">
                          <h4 className="font-semibold flex items-center gap-2 mb-2"><ListChecks className="w-5 h-5 text-primary" /> Recommended Actions</h4>
                          {scan.recommendedActions.length > 0 ? (
                            <ul className="space-y-2">
                            {scan.recommendedActions.map((action, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 mt-0.5 text-primary shrink-0"/>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                          ) : (
                             <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                               <ShieldCheck className="w-4 h-4 text-green-600" />
                               No specific actions required, your crop looks healthy!
                            </p>
                          )}
                      </div>
                   </div>
                </AccordionContent>
              </AccordionItem>
            ))
          ) : (
            <div className="h-24 text-center flex items-center justify-center">
                No scans have been recorded yet.
            </div>
          )}
        </Accordion>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Scans</CardTitle>
        <CardDescription>
          A log of the most recent crop analyses. Click on a scan to see details and recommended actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {renderContent()}
      </CardContent>
    </Card>
  )
}
