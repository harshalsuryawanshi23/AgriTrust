"use client";

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/icons/logo';
import { SidebarNav } from './sidebar-nav';
import { Header } from './header';
import { Button } from '../ui/button';
import { LogOut, Settings } from 'lucide-react';

// Memoize footer component to prevent unnecessary re-renders
const SidebarFooterContent = React.memo(() => (
  <>
    <Separator className="my-2" />
    <div className="flex flex-col gap-2 p-2">
       <Button variant="ghost" className="justify-start gap-2">
          <Settings className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Settings</span>
       </Button>
       <Button variant="ghost" className="justify-start gap-2">
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Log out</span>
       </Button>
    </div>
  </>
));

SidebarFooterContent.displayName = 'SidebarFooterContent';

export const AppShell = React.memo(({ children }: { children: React.ReactNode }) => {
  // Use responsive breakpoint for initial sidebar state
  const [open, setOpen] = React.useState(true);
  
  // Detect screen size and adjust sidebar behavior
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setOpen(false); // Close sidebar on mobile
      } else {
        setOpen(true); // Open sidebar on desktop
      }
    };
    
    // Set initial state
    if (mediaQuery.matches) {
      setOpen(false);
    }
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Memoize sidebar content to prevent unnecessary re-renders
  const sidebarContent = React.useMemo(() => (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-sidebar-border sidebar-container"
    >
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterContent />
      </SidebarFooter>
    </Sidebar>
  ), []);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      {sidebarContent}
      <SidebarInset className="smooth-transform">
        <Header />
        <main className="min-h-0 flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
});

AppShell.displayName = 'AppShell';
