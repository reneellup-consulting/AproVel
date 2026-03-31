"use client";

import { Button } from "@/components/ui/button";
import { PhoneMockup } from "@/components/phone-mockup";
// Removed Monitor from the import list
import { Smartphone } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <div className="animate-fade-in-up delay-0 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {siteConfig.releaseName}
            </div>

            <h1 className="animate-fade-in-up delay-100 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground text-balance">
              Approvals made <span className="text-primary">simple</span> for{" "}
              {siteConfig.shortCompanyName}
            </h1>

            <p className="animate-fade-in-up delay-200 text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {siteConfig.description}
            </p>

            <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-0.5"
              >
                <a href="/api/download/latest">
                  <Smartphone className="w-5 h-5" />
                  Download Enterprise APK
                </a>
              </Button>
              {/* Web Dashboard Button was removed from here */}
            </div>

            <p className="animate-fade-in-up delay-400 mt-4 text-xs text-muted-foreground">
              Requires {siteConfig.minAndroidVersion} or later. Authorized
              personnel only.
            </p>
          </div>

          {/* Right content - Phone mockup with float */}
          <div className="animate-fade-in-up delay-300 relative lg:h-[600px] flex items-center justify-center">
            <div className="animate-phone-float">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
