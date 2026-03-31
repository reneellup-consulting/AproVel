"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character",
      ),
    passwordAgain: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character",
      ),
  })
  .refine((data) => data.password === data.passwordAgain, {
    message: "Passwords don't match",
    path: ["passwordAgain"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  userId: string;
  secret: string;
}

export function ResetPasswordForm({ userId, secret }: ResetPasswordFormProps) {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showPasswordAgain, setShowPasswordAgain] = React.useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordAgain: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: ResetPasswordValues) {
    setGlobalError(null);
    try {
      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          secret,
          password: data.password,
          passwordAgain: data.passwordAgain,
        }),
      };

      // Ensure we hit the user-specified API Endpoint here
      const response = await fetch(
        "https://aprvel-api.gavellogistics.com/api/reset-password",
        requestOptions,
      );

      const resultText = await response.text();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        try {
          // If the backend sends JSON error like {"message": "invalid credentials"}
          const resultJson = JSON.parse(resultText);
          setGlobalError(
            resultJson.message ||
              "Failed to reset password. The link might be expired or invalid.",
          );
        } catch {
          // Fallback to raw text or generic message
          setGlobalError(
            resultText || "Failed to reset password. Please try again.",
          );
        }
      }
    } catch (error) {
      console.error(error);
      setGlobalError(
        "A network error occurred while connecting to the server.",
      );
    }
  }

  // 1. Success State
  if (isSuccess) {
    return (
      <div className="text-center animate-fade-in-up text-center">
        <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 ring-4 ring-primary/5 email-check-pop">
          <CheckCircle2 className="w-10 h-10 text-primary email-check-draw" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Password Updated!
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Your password has been successfully reset.
        </p>

        <div className="my-8 border-t border-border" />

        <div className="rounded-xl bg-primary/5 border border-primary/10 p-5 text-left animate-fade-in-up delay-200">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            What&apos;s next?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Open the{" "}
            <strong className="text-foreground">{siteConfig.name}</strong> app
            on your device and sign in with your new password to get started.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center w-full mt-8 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 transition-all duration-200 animate-fade-in-up delay-300"
        >
          Go to Homepage
        </Link>
      </div>
    );
  }

  // 2. Form State
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {globalError && (
          <Alert
            variant="destructive"
            className="animate-fade-in-up bg-destructive/10 border-destructive/20 text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordAgain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPasswordAgain ? "text" : "password"}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswordAgain((prev) => !prev)}
                  >
                    {showPasswordAgain ? (
                      <EyeOff
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span className="sr-only">
                      {showPasswordAgain ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full mt-4 h-11 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 transition-all font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Resetting Password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </Form>
  );
}
