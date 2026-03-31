import { Loader2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { AnimatedBackground } from "@/components/animated-background";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background relative flex items-center justify-center">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 py-12">
        {/* Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-xl shadow-primary/5 p-12 flex flex-col items-center justify-center text-center">
          <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 ring-4 ring-primary/5">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Verifying your email...
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Please wait a moment while we confirm your details.
          </p>
        </div>
      </div>
    </main>
  );
}
