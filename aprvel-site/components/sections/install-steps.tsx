"use client"

import { TriangleAlert } from "lucide-react"
import { siteConfig } from "@/config/site"
import { installSteps } from "@/config/install-steps"
import { useAnimateOnScroll } from "@/hooks/use-animate-on-scroll"

export function InstallSteps() {
  const { ref: sectionRef, isVisible } = useAnimateOnScroll({ threshold: 0.1 })

  return (
    <section ref={sectionRef} className="py-16 bg-card border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-12 animate-on-scroll ${isVisible ? "is-visible" : ""}`}
        >
          <span className="text-primary font-bold uppercase tracking-wide text-sm">
            Getting Started
          </span>
          <h2 className="text-3xl font-bold mt-2 text-foreground">How to Install</h2>
          <p className="text-muted-foreground mt-2">
            Since this is an internal enterprise application, you may need to adjust your settings.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {installSteps.map((step, index) => (
            <div
              key={step.number}
              className={`bg-muted/7 p-6 rounded-xl border border-border animate-on-scroll ${isVisible ? "is-visible" : ""}`}
              style={{
                transitionDelay: isVisible ? `${(index + 1) * 100}ms` : "0ms",
              }}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Security notice */}
        <div
          className={`mt-10 p-4 bg-primary/5 border-l-4 border-primary rounded-r text-sm text-foreground flex gap-3 items-start animate-on-scroll ${isVisible ? "is-visible" : ""}`}
          style={{ transitionDelay: isVisible ? "500ms" : "0ms" }}
        >
          <TriangleAlert className="w-6 h-6 text-primary shrink-0" />
          <div>
            <strong>Security Notice:</strong> This application is for internal use by {siteConfig.shortCompanyName} employees only. Do not share the APK file externally. If
            you experience issues, please contact IT Support.
          </div>
        </div>
      </div>
    </section>
  )
}
