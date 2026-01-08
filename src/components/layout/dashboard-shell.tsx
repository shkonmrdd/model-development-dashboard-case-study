"use client"

import * as React from "react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader, type SiteHeaderProps } from "@/components/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

type DashboardShellProps = SiteHeaderProps & {
  children: React.ReactNode
}

export function DashboardShell({ children, ...headerProps }: DashboardShellProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader {...headerProps} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 py-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
