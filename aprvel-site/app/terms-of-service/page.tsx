import { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: `Terms of Service | ${siteConfig.name} - ${siteConfig.companyName}`,
  description: `Terms of Service for ${siteConfig.name}, the enterprise logistics management portal by ${siteConfig.companyName}.`,
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link
              href="/"
              className="hover:text-primary transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Terms of Service</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Please read these terms carefully before using{" "}
            <strong className="text-foreground">{siteConfig.name}</strong>.
            By accessing or using the application, you agree to be bound by
            these terms.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: March 16, 2026
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">

            {/* Section 1 */}
            <TermsSection number="1" title="Acceptance of Terms">
              <p>
                By downloading, installing, or using {siteConfig.name}{" "}
                (&quot;the Application&quot;), you acknowledge that you have
                read, understood, and agree to be bound by these Terms of
                Service (&quot;Terms&quot;). If you do not agree to these Terms,
                you must not access or use the Application.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you
                and{" "}
                <strong>{siteConfig.companyName}</strong>{" "}
                (&quot;the Company,&quot; &quot;we,&quot; &quot;us,&quot; or
                &quot;our&quot;) governing your use of the Application.
              </p>
            </TermsSection>

            {/* Section 2 */}
            <TermsSection number="2" title="Eligibility & Authorized Use">
              <p>
                {siteConfig.name} is intended solely for authorized employees
                and personnel of {siteConfig.shortCompanyName}. By using the
                Application, you represent and warrant that:
              </p>
              <ul>
                <li>
                  You are a current employee, contractor, or authorized
                  representative of {siteConfig.shortCompanyName}.
                </li>
                <li>
                  You have been granted access credentials by your
                  organization&apos;s IT administrator.
                </li>
                <li>
                  You will use the Application only for legitimate business
                  purposes consistent with your role and responsibilities.
                </li>
              </ul>
            </TermsSection>

            {/* Section 3 */}
            <TermsSection number="3" title="Account & Credentials">
              <p>
                You are responsible for maintaining the confidentiality of your
                login credentials and for all activities that occur under your
                account. You agree to:
              </p>
              <ul>
                <li>
                  Keep your credentials secure and not share them with any other
                  person.
                </li>
                <li>
                  Immediately notify your IT administrator of any unauthorized
                  use of your account or any other security breach.
                </li>
                <li>
                  Log out of your account at the end of each session, especially
                  on shared or public devices.
                </li>
              </ul>
              <p>
                {siteConfig.shortCompanyName} reserves the right to suspend or
                terminate access to any account suspected of being compromised
                or misused.
              </p>
            </TermsSection>

            {/* Section 4 */}
            <TermsSection number="4" title="Permitted Use">
              <p>
                You may use {siteConfig.name} to:
              </p>
              <ul>
                <li>
                  Create, review, and manage purchase orders and requisitions.
                </li>
                <li>
                  Approve or reject procurement requests within your authorized
                  scope.
                </li>
                <li>
                  View spending metrics, reports, and analytics relevant to your
                  department or role.
                </li>
                <li>
                  Receive and respond to notifications related to your workflow
                  activities.
                </li>
              </ul>
            </TermsSection>

            {/* Section 5 */}
            <TermsSection number="5" title="Prohibited Conduct">
              <p>
                When using {siteConfig.name}, you agree <strong>not</strong> to:
              </p>
              <ul>
                <li>
                  Access or attempt to access data, accounts, or systems beyond
                  your authorized scope.
                </li>
                <li>
                  Reverse-engineer, decompile, disassemble, or otherwise attempt
                  to derive the source code of the Application.
                </li>
                <li>
                  Modify, adapt, translate, or create derivative works based on
                  the Application.
                </li>
                <li>
                  Use the Application to transmit any malicious code, viruses,
                  or harmful content.
                </li>
                <li>
                  Share, distribute, or make the Application available to any
                  unauthorized third party.
                </li>
                <li>
                  Use the Application in any manner that could damage, disable,
                  or impair the service or interfere with other users.
                </li>
              </ul>
            </TermsSection>

            {/* Section 6 */}
            <TermsSection number="6" title="Intellectual Property">
              <p>
                The Application, including all content, features, functionality,
                designs, graphics, trademarks, and underlying technology, is and
                remains the exclusive property of{" "}
                {siteConfig.companyName}. These Terms do not grant you any
                ownership rights in the Application.
              </p>
              <p>
                All data, reports, and materials generated through the
                Application in the course of business operations remain the
                property of {siteConfig.shortCompanyName}.
              </p>
            </TermsSection>

            {/* Section 7 */}
            <TermsSection number="7" title="Data & Privacy">
              <p>
                Your use of {siteConfig.name} is also governed by our{" "}
                <Link
                  href="/privacy-policy"
                  className="text-primary hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
                , which describes how we collect, use, and protect your
                information. By using the Application, you consent to the
                collection and use of information as described in the Privacy
                Policy.
              </p>
            </TermsSection>

            {/* Section 8 */}
            <TermsSection number="8" title="Availability & Modifications">
              <p>
                We strive to maintain the availability of {siteConfig.name} at
                all times but do not guarantee uninterrupted or error-free
                service. We reserve the right to:
              </p>
              <ul>
                <li>
                  Modify, update, or discontinue any feature or functionality of
                  the Application at any time, with or without notice.
                </li>
                <li>
                  Perform scheduled or emergency maintenance that may
                  temporarily affect your access to the Application.
                </li>
                <li>
                  Release new versions of the Application that may require you
                  to update your installation.
                </li>
              </ul>
            </TermsSection>

            {/* Section 9 */}
            <TermsSection number="9" title="Disclaimer of Warranties">
              <p>
                The Application is provided on an &quot;as-is&quot; and
                &quot;as-available&quot; basis.{" "}
                {siteConfig.shortCompanyName} makes no warranties, express or
                implied, regarding the Application, including but not limited to
                implied warranties of merchantability, fitness for a particular
                purpose, or non-infringement.
              </p>
              <p>
                We do not warrant that the Application will meet all of your
                requirements, operate without interruption, or be free of
                errors, bugs, or security vulnerabilities.
              </p>
            </TermsSection>

            {/* Section 10 */}
            <TermsSection number="10" title="Limitation of Liability">
              <p>
                To the maximum extent permitted by applicable law,{" "}
                {siteConfig.companyName}, its officers, directors, employees,
                and agents shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages arising out of or
                related to your use of the Application.
              </p>
              <p>
                This includes, without limitation, damages for loss of profits,
                data, business opportunities, or goodwill, even if we have been
                advised of the possibility of such damages.
              </p>
            </TermsSection>

            {/* Section 11 */}
            <TermsSection number="11" title="Termination">
              <p>
                {siteConfig.shortCompanyName} may suspend or terminate your
                access to {siteConfig.name} at any time and for any reason,
                including but not limited to:
              </p>
              <ul>
                <li>
                  Violation of these Terms or any applicable company policies.
                </li>
                <li>
                  Separation from employment or end of contractual relationship
                  with {siteConfig.shortCompanyName}.
                </li>
                <li>
                  Suspected unauthorized or fraudulent use of the Application.
                </li>
              </ul>
              <p>
                Upon termination, your right to access the Application ceases
                immediately, and any data associated with your account may be
                retained or deleted in accordance with our data retention
                policies.
              </p>
            </TermsSection>

            {/* Section 12 */}
            <TermsSection number="12" title="Changes to These Terms">
              <p>
                We may revise these Terms of Service from time to time.
                When we make material changes, we will notify users through the
                Application or via email. Your continued use of the Application
                following the posting of revised Terms constitutes your
                acceptance of the changes.
              </p>
              <p>
                We encourage you to review these Terms periodically to stay
                informed of any updates.
              </p>
            </TermsSection>

            {/* Section 13 */}
            <TermsSection number="13" title="Governing Law">
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of the Republic of the Philippines, without regard
                to conflict of law principles. Any disputes arising out of or
                relating to these Terms or your use of the Application shall be
                subject to the exclusive jurisdiction of the courts located in
                the Philippines.
              </p>
            </TermsSection>

            {/* Section 14 */}
            <TermsSection number="14" title="Contact Us">
              <p>
                If you have any questions or concerns about these Terms of
                Service, please reach out:
              </p>
              <div className="mt-4 rounded-xl border border-border bg-card p-6 not-prose">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">
                      Company
                    </span>
                    <span className="text-foreground font-medium">
                      {siteConfig.companyName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">
                      Department
                    </span>
                    <span className="text-foreground font-medium">
                      Information Technology / Legal
                    </span>
                  </div>
                </div>
              </div>
            </TermsSection>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

/* ─── Reusable Section Component ─── */

function TermsSection({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <article className="group" id={`section-${number}`}>
      <div className="flex items-start gap-4">
        <span className="mt-1 shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-foreground tracking-tight mb-3">
            {title}
          </h2>
          <div className="prose prose-sm max-w-none text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-3 [&_ul]:mt-2 [&_ul]:mb-3 [&_ul]:space-y-2 [&_li]:pl-1 [&_strong]:text-foreground">
            {children}
          </div>
        </div>
      </div>
    </article>
  )
}
