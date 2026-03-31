import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { AnimatedBackground } from "@/components/animated-background";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // In Next.js 15+, searchParams must be awaited
  const params = await searchParams;
  
  const userId = params.userId as string;
  const secret = params.secret as string;

  let isSuccess = false;
  let errorMessage = "Invalid or missing verification link parameters.";

  if (userId && secret) {
    try {
      // Direct call to your backend, exactly as it was in route.ts
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email-verification`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, secret }),
        cache: "no-store", // Prevents Next.js from aggressively caching the API request
      });

      if (response.ok) {
        isSuccess = true;
      } else {
        isSuccess = false;
        
        try {
          const resultText = await response.text();
          
          if (resultText && !resultText.trim().startsWith("<!DOCTYPE")) {
            try {
              // First try to parse as JSON (ex: {"success":false,"message":"Invalid or expired verification link."})
              const resultJson = JSON.parse(resultText);
              if (resultJson.message) {
                // If the backend sends exactly this string, override it with the helpful mobile app instruction
                if (resultJson.message === "Invalid or expired verification link.") {
                  errorMessage = "The link may have expired or already been used. To request a new one, please log in to the mobile app.";
                } else {
                  errorMessage = resultJson.message;
                }
              } else {
                errorMessage = resultText;
              }
            } catch (err) {
              errorMessage = resultText;
            }
          } else {
             errorMessage = "Verification failed.";
          }
        } catch(e) {
          errorMessage = "Verification failed.";
        }
      }
    } catch (error) {
      isSuccess = false;
      errorMessage = "An unexpected network error occurred mapping to the backend server.";
      console.error(error);
    }
  }

  return (
    <main className="min-h-screen bg-background relative flex items-center justify-center">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 py-12">
        {/* Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-xl shadow-primary/5 overflow-hidden">
          {/* Gradient accent bar */}
          <div className="h-1.5 bg-linear-to-r from-primary via-primary/80 to-primary/50" />

          <div className="px-8 pt-10 pb-10 text-center">
            
            {/* 1. Error State */}
            {!isSuccess && (
              <div className="animate-fade-in-up">
                <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 ring-4 ring-destructive/5">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Email Verification Failed
                </h1>
                <p className="mt-3 text-muted-foreground leading-relaxed mb-8">
                  {errorMessage}
                </p>

                <div className="my-8 border-t border-border" />

                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 transition-all duration-200 animate-fade-in-up delay-300"
                >
                  Go to Homepage
                </Link>
              </div>
            )}

            {/* 2. Success State */}
            {isSuccess && (
              <div className="animate-fade-in-up">
                <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 ring-4 ring-primary/5 email-check-pop">
                  <CheckCircle2 className="w-10 h-10 text-primary email-check-draw" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Email Verified!
                </h1>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Your email address has been successfully confirmed. Your{" "}
                  <strong className="text-foreground">{siteConfig.name}</strong>{" "}
                  account is now fully activated.
                </p>

                <div className="my-8 border-t border-border" />

                <div className="rounded-xl bg-primary/5 border border-primary/10 p-5 text-left animate-fade-in-up delay-200">
                  <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    What&apos;s next?
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Open the <strong className="text-foreground">{siteConfig.name}</strong> app
                    on your device and sign in with your verified email to get started.
                  </p>
                </div>

                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 mt-8 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 transition-all duration-200 animate-fade-in-up delay-300"
                >
                  Go to Homepage
                </Link>
              </div>
            )}

          </div>
        </div>

        {/* Brand footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground animate-fade-in-up delay-400">
          © {siteConfig.year} {siteConfig.companyName}
        </p>
      </div>
    </main>
  );
}
