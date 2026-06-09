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

interface AdminLayoutProps {
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

export function AdminLayout({
  sidebarItems,
  sidebarHeader,
  sidebarFooter,
  navTitle,
  navLogo,
  navActions,
  navUser,
  children,
  className,
}: AdminLayoutProps) {
  return (
    <div className={cn("flex h-screen overflow-hidden bg-surface-container-low", className)}>
      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        header={sidebarHeader}
        footer={sidebarFooter}
      />

      {/* Right side: admin notice + TopNav + content */}
      <div className="flex flex-col flex-1 ml-64 min-w-0">
        {/* Admin notice bar */}
        <div className="flex-shrink-0 bg-[#FEF3C7] text-[#92400E] border-b border-[#FCD34D] text-body-sm text-center py-2 px-4 z-50 relative">
          您正在以管理员身份操作
        </div>

        <TopNav
          title={navTitle}
          logo={navLogo}
          actions={navActions}
          user={navUser}
          className="left-64 top-[36px]"
        />

        <main className="flex-1 overflow-auto p-md bg-surface-container-low mt-14">
          {children}
        </main>
      </div>
    </div>
  )
}
