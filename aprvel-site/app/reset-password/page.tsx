import Link from "next/link";
import { XCircle, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { AnimatedBackground } from "@/components/animated-background";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const userId = typeof params.userId === "string" ? params.userId : undefined;
  const secret = typeof params.secret === "string" ? params.secret : undefined;
  const expire = typeof params.expire === "string" ? params.expire : undefined;

  const isValidLink = !!(userId && secret);

  let isExpired = false;
  if (expire) {
    const expireDate = new Date(expire);
    if (!isNaN(expireDate.getTime()) && expireDate < new Date()) {
      isExpired = true;
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
            {/* 1. Error State for Missing Params */}
            {!isValidLink ? (
              <div className="animate-fade-in-up">
                <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 ring-4 ring-destructive/5">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Invalid Link
                </h1>
                <p className="mt-3 text-muted-foreground leading-relaxed mb-8">
                  The password reset link is invalid or missing required
                  parameters. Please request a new link from the mobile app.
                </p>

                <div className="my-8 border-t border-border" />

                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 transition-all duration-200 animate-fade-in-up delay-300"
                >
                  Go to Homepage
                </Link>
              </div>
            ) : isExpired ? (
              /* 2. Error State for Expired Link */
              <div className="animate-fade-in-up">
                <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 ring-4 ring-destructive/5">
                  <Clock className="w-10 h-10 text-destructive" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Link Expired
                </h1>
                <p className="mt-3 text-muted-foreground leading-relaxed mb-8">
                  The password reset link has expired. Please request a new link
                  from the mobile app.
                </p>

                <div className="my-8 border-t border-border" />

                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 transition-all duration-200 animate-fade-in-up delay-300"
                >
                  Go to Homepage
                </Link>
              </div>
            ) : (
              /* 3. Form State */
              <div className="animate-fade-in-up text-left">
                <div className="text-center mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Reset Password
                  </h1>
                  <p className="mt-2 text-muted-foreground text-sm">
                    Please enter a new password for your account.
                  </p>
                </div>

                <ResetPasswordForm userId={userId} secret={secret} />
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
