import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <SidebarNav />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <SidebarInset>
              {children}
            </SidebarInset>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
