"use client"

import { siteConfig } from "@/config/site"
import Image from "next/image"
import Link from "next/link"
import logoLight from "@/assets/logo_light.png"
import { useAnimateOnScroll } from "@/hooks/use-animate-on-scroll"

export function Footer() {
  const { ref: footerRef, isVisible } = useAnimateOnScroll({ threshold: 0.2 })

  return (
    <footer
      ref={footerRef}
      className={`bg-card border-t border-border py-12 animate-on-scroll ${isVisible ? "is-visible" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          {/* <ShieldCheck className="w-6 h-6 text-primary" /> */}
          <Image src={logoLight} alt={siteConfig.name} width={33} height={28} priority />
          <span className="text-foreground font-bold">{siteConfig.name}</span>
        </div>

        <div className="text-center md:text-right">
          <p className="text-sm text-muted-foreground">
            © {siteConfig.year} {siteConfig.companyName} All rights reserved.
          </p>
          <div className="flex justify-center md:justify-end gap-4 mt-2">
            <Link
              href="/privacy-policy"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/it-support"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              IT Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
