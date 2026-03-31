"use client"

import { siteConfig } from "@/config/site"
import Image from "next/image"
import logoLight from "@/assets/logo_light.png"

export function Header() {
  return (
    <header className="fixed w-full z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Image src={logoLight} alt={siteConfig.name} width={49} height={42} priority />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-foreground">{siteConfig.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{siteConfig.companyName}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
