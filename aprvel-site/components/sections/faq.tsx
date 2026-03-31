"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useAnimateOnScroll } from "@/hooks/use-animate-on-scroll"

const faqs = [
  {
    question: "Why isn't this app on the Play Store?",
    answer:
      "Aprvel is a proprietary internal tool containing sensitive company data. To maintain security and rapid deployment cycles, we distribute it directly via our secure enterprise server rather than public app stores.",
  },
  {
    question: 'Is it safe to install from "Unknown Sources"?',
    answer:
      'Yes, as long as you are downloading the APK directly from this portal (GS Gavel Logistics domain). "Unknown Sources" simply means the source is not the Google Play Store. You can disable this setting after installation if you prefer.',
  },
  {
    question: "I have an iPhone, can I use the app?",
    answer:
      "Currently, the native mobile app is Android only. iOS users can access the full functionality by logging into the Web Dashboard through Safari or Chrome.",
  },
]

export function FAQ() {
  const { ref: sectionRef, isVisible } = useAnimateOnScroll({ threshold: 0.15 })

  return (
    <section ref={sectionRef} className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className={`text-2xl font-bold text-center mb-8 text-foreground animate-on-scroll ${isVisible ? "is-visible" : ""}`}
        >
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className={`bg-card px-4 rounded-lg shadow-sm border border-border animate-on-scroll ${isVisible ? "is-visible" : ""}`}
              style={{
                transitionDelay: isVisible ? `${(index + 1) * 100}ms` : "0ms",
              }}
            >
              <AccordionTrigger className="text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
