import { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name} - ${siteConfig.companyName}`,
  description: `Privacy Policy for ${siteConfig.name}, the enterprise logistics management portal by ${siteConfig.companyName}.`,
}

export default function PrivacyPolicyPage() {
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
            <span className="text-foreground font-medium">Privacy Policy</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Your privacy is important to us. This policy outlines how{" "}
            <strong className="text-foreground">{siteConfig.companyName}</strong>{" "}
            collects, uses, and protects your information when you use{" "}
            <strong className="text-foreground">{siteConfig.name}</strong>.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: March 16, 2026
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">

            {/* Section 1 */}
            <PolicySection number="1" title="Information We Collect">
              <p>
                When you use {siteConfig.name}, we may collect the following
                types of information:
              </p>
              <ul>
                <li>
                  <strong>Account Information</strong> — Your employee name,
                  email address, department, and role as provided by your
                  organization.
                </li>
                <li>
                  <strong>Usage Data</strong> — Information about how you
                  interact with the application, including features accessed,
                  timestamps, and session duration.
                </li>
                <li>
                  <strong>Device Information</strong> — Device model, operating
                  system version, unique device identifiers, and network
                  information.
                </li>
                <li>
                  <strong>Transaction Data</strong> — Purchase order details,
                  requisition records, and approval history generated through
                  your use of the application.
                </li>
              </ul>
            </PolicySection>

            {/* Section 2 */}
            <PolicySection number="2" title="How We Use Your Information">
              <p>
                We use the information we collect for the following purposes:
              </p>
              <ul>
                <li>
                  To provide, maintain, and improve the {siteConfig.name}{" "}
                  application and its features.
                </li>
                <li>
                  To authenticate your identity and authorize access to
                  enterprise resources.
                </li>
                <li>
                  To process and track purchase orders, requisitions, and
                  approval workflows.
                </li>
                <li>
                  To generate spending metrics, reports, and analytics for
                  organizational use.
                </li>
                <li>
                  To send notifications related to your pending approvals,
                  order updates, and system alerts.
                </li>
                <li>
                  To ensure the security and integrity of the application and
                  detect unauthorized access.
                </li>
              </ul>
            </PolicySection>

            {/* Section 3 */}
            <PolicySection number="3" title="Data Storage &amp; Security">
              <p>
                We implement industry-standard security measures to protect your
                information:
              </p>
              <ul>
                <li>
                  All data is transmitted using TLS/SSL encryption.
                </li>
                <li>
                  Access to personal data is restricted to authorized personnel
                  on a need-to-know basis.
                </li>
                <li>
                  Regular security audits and vulnerability assessments are
                  conducted to maintain data integrity.
                </li>
                <li>
                  Data is stored on secure servers with appropriate physical and
                  logical access controls.
                </li>
              </ul>
              <p>
                While we strive to protect your information, no method of
                electronic storage or transmission is 100% secure. We cannot
                guarantee absolute security.
              </p>
            </PolicySection>

            {/* Section 4 */}
            <PolicySection number="4" title="Data Sharing &amp; Disclosure">
              <p>
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in the
                following circumstances:
              </p>
              <ul>
                <li>
                  <strong>Within the Organization</strong> — With authorized
                  managers and administrators within{" "}
                  {siteConfig.shortCompanyName} as necessary for business
                  operations.
                </li>
                <li>
                  <strong>Service Providers</strong> — With trusted third-party
                  service providers who assist in operating and maintaining the
                  application, subject to confidentiality obligations.
                </li>
                <li>
                  <strong>Legal Requirements</strong> — When required by law,
                  regulation, or legal process, or to protect the rights,
                  property, or safety of {siteConfig.shortCompanyName}, its
                  employees, or others.
                </li>
              </ul>
            </PolicySection>

            {/* Section 5 */}
            <PolicySection number="5" title="Data Retention">
              <p>
                We retain your personal information for as long as your
                employment with {siteConfig.shortCompanyName} is active and as
                needed to fulfill the purposes outlined in this policy.
                Transaction and approval records may be retained for a longer
                period to comply with legal, accounting, or regulatory
                requirements.
              </p>
            </PolicySection>

            {/* Section 6 */}
            <PolicySection number="6" title="Your Rights">
              <p>
                Depending on your jurisdiction, you may have the following
                rights regarding your personal information:
              </p>
              <ul>
                <li>
                  <strong>Access</strong> — Request a copy of the personal data
                  we hold about you.
                </li>
                <li>
                  <strong>Correction</strong> — Request correction of any
                  inaccurate or incomplete data.
                </li>
                <li>
                  <strong>Deletion</strong> — Request deletion of your personal
                  data, subject to legal and business requirements.
                </li>
                <li>
                  <strong>Portability</strong> — Request a portable copy of your
                  data in a commonly used format.
                </li>
              </ul>
              <p>
                To exercise any of these rights, please contact your IT
                administrator or the information security team.
              </p>
            </PolicySection>

            {/* Section 7 */}
            <PolicySection number="7" title="Third-Party Services">
              <p>
                {siteConfig.name} may integrate with third-party services for
                analytics, crash reporting, or other functionality. These
                services may collect information as governed by their own
                privacy policies. We encourage you to review the privacy
                policies of any third-party services that interact with the
                application.
              </p>
            </PolicySection>

            {/* Section 8 */}
            <PolicySection number="8" title="Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or legal requirements. When we make
                material changes, we will notify users through the application
                or via email. The &quot;Last updated&quot; date at the top of this page
                indicates when the policy was most recently revised.
              </p>
            </PolicySection>

            {/* Section 9 */}
            <PolicySection number="9" title="Contact Us">
              <p>
                If you have any questions or concerns about this Privacy Policy
                or our data practices, please reach out:
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
                      Information Technology / Data Privacy
                    </span>
                  </div>
                </div>
              </div>
            </PolicySection>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

/* ─── Reusable Section Component ─── */

function PolicySection({
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
