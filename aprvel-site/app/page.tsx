import { Header } from "@/components/layout/header"
import { Hero } from "@/components/sections/hero"
import { InstallSteps } from "@/components/sections/install-steps"
import { FAQ } from "@/components/sections/faq"
import { Footer } from "@/components/layout/footer"
import { AnimatedBackground } from "@/components/animated-background"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <AnimatedBackground />
      <Header />
      <Hero />
      <InstallSteps />
      <FAQ />
      <Footer />
    </main>
  )
}
