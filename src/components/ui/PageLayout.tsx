"use client"

import * as React from "react"
import { cn } from "./utils"
import { Sidebar } from "./Sidebar"
import { TopNav } from "./TopNav"

interface SidebarItem {
  label: string
  href: string
  icon?: React.ReactNode
  active?: boolean
}

interface PageLayoutProps {
  // Sidebar props
  sidebarItems: SidebarItem[]
  sidebarHeader?: React.ReactNode
  sidebarFooter?: React.ReactNode

  // TopNav props
  navTitle?: string
  navLogo?: React.ReactNode
  navActions?: React.ReactNode
  navUser?: { name: string; avatar?: string }

  children: React.ReactNode
  className?: string
}

export function PageLayout({
  sidebarItems,
  sidebarHeader,
  sidebarFooter,
  navTitle,
  navLogo,
  navActions,
  navUser,
  children,
  className,
}: PageLayoutProps) {
  return (
    <div className={cn("flex h-screen overflow-hidden bg-surface-container-low", className)}>
      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        header={sidebarHeader}
        footer={sidebarFooter}
      />

      {/* Right side: TopNav + content */}
      <div className="flex flex-col flex-1 ml-64 min-w-0">
        <TopNav
          title={navTitle}
          logo={navLogo}
          actions={navActions}
          user={navUser}
          className="left-64"
        />
        <main className="flex-1 overflow-auto p-md bg-surface-container-low mt-14">
          {children}
        </main>
      </div>
    </div>
  )
}
