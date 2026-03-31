import { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: `IT Support | ${siteConfig.name} - ${siteConfig.companyName}`,
  description: `IT Support resources for ${siteConfig.name}, the enterprise logistics management portal by ${siteConfig.companyName}. Get help with installation, login, troubleshooting, and more.`,
}

export default function ITSupportPage() {
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
            <span className="text-foreground font-medium">IT Support</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            IT Support
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Need help with{" "}
            <strong className="text-foreground">{siteConfig.name}</strong>?
            Find answers to common issues, installation guidance, and
            contact information for the IT department below.
          </p>
        </div>
      </section>

      {/* Quick Help Cards */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-4">
            <QuickHelpCard
              icon="📱"
              title="Installation"
              description="Issues downloading or installing the APK on your device."
              sectionId="section-1"
            />
            <QuickHelpCard
              icon="🔐"
              title="Login & Access"
              description="Can&apos;t log in, forgot credentials, or account locked."
              sectionId="section-2"
            />
            <QuickHelpCard
              icon="⚙️"
              title="App Issues"
              description="Crashes, errors, slow performance, or missing features."
              sectionId="section-3"
            />
          </div>
        </div>
      </section>

      {/* Support Content */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">

            {/* Section 1 */}
            <SupportSection number="1" title="Installation & Setup">
              <p>
                If you are having trouble installing {siteConfig.name} on
                your Android device, try the following steps:
              </p>
              <ul>
                <li>
                  <strong>Enable Unknown Sources</strong> — Go to{" "}
                  <em>Settings → Security → Unknown Sources</em> and enable
                  it to allow APK installation from outside the Play Store.
                </li>
                <li>
                  <strong>Minimum Requirements</strong> — Ensure your device
                  is running {siteConfig.minAndroidVersion} or higher with
                  at least 100 MB of free storage.
                </li>
                <li>
                  <strong>Download Failed</strong> — If the APK download is
                  interrupted, clear your browser cache and try downloading
                  again from the official portal.
                </li>
                <li>
                  <strong>&quot;App Not Installed&quot; Error</strong> — Uninstall any
                  previous version of the app, then retry the installation.
                  If the issue persists, contact IT.
                </li>
              </ul>
            </SupportSection>

            {/* Section 2 */}
            <SupportSection number="2" title="Login & Account Access">
              <p>
                Access to {siteConfig.name} is managed through your
                organization credentials. If you are experiencing login
                issues:
              </p>
              <ul>
                <li>
                  <strong>Forgot Password</strong> — Use the &quot;Forgot
                  Password&quot; link on the login screen to reset your
                  credentials via your registered email.
                </li>
                <li>
                  <strong>Account Locked</strong> — After multiple failed
                  login attempts, your account may be temporarily locked.
                  Wait 15 minutes or contact IT to unlock it.
                </li>
                <li>
                  <strong>New Employee</strong> — If you are a new employee
                  and have not yet received login credentials, contact your
                  department head or IT administrator to request access
                  provisioning.
                </li>
                <li>
                  <strong>Session Expired</strong> — For security purposes,
                  sessions expire after a period of inactivity. Simply log
                  in again with your credentials.
                </li>
              </ul>
            </SupportSection>

            {/* Section 3 */}
            <SupportSection number="3" title="App Performance & Errors">
              <p>
                If {siteConfig.name} is not performing as expected, try
                these troubleshooting steps:
              </p>
              <ul>
                <li>
                  <strong>App Crashes on Launch</strong> — Ensure you are
                  running the latest version ({siteConfig.version}). Clear
                  the app cache from{" "}
                  <em>Settings → Apps → {siteConfig.name} → Clear Cache</em>.
                </li>
                <li>
                  <strong>Slow Performance</strong> — Close other background
                  applications and ensure you have a stable network
                  connection. The app requires internet access to function.
                </li>
                <li>
                  <strong>Data Not Loading</strong> — Check your internet
                  connection. If connected, try logging out and logging back
                  in. The issue may also be due to scheduled server
                  maintenance.
                </li>
                <li>
                  <strong>Error Messages</strong> — Take a screenshot of
                  the error message and include it when reporting the issue
                  to IT support for faster resolution.
                </li>
              </ul>
            </SupportSection>

            {/* Section 4 */}
            <SupportSection number="4" title="Purchase Orders & Approvals">
              <p>
                For issues related to the core business workflows in{" "}
                {siteConfig.name}:
              </p>
              <ul>
                <li>
                  <strong>Missing Purchase Order</strong> — If a purchase
                  order is not appearing in your list, verify the date range
                  filter and ensure you have the appropriate access
                  permissions for that department.
                </li>
                <li>
                  <strong>Approval Not Reflected</strong> — Approval
                  updates may take a few moments to sync. Pull down to
                  refresh the list. If the issue persists, check with your
                  IT administrator.
                </li>
                <li>
                  <strong>Unable to Create Requisition</strong> — Ensure
                  all required fields are filled in and that your role has
                  the necessary permissions to create requisitions.
                </li>
                <li>
                  <strong>Notification Issues</strong> — If you are not
                  receiving push notifications, check that notifications are
                  enabled for {siteConfig.name} in your device settings.
                </li>
              </ul>
            </SupportSection>

            {/* Section 5 */}
            <SupportSection number="5" title="Network & Connectivity">
              <p>
                {siteConfig.name} requires a stable internet connection to
                operate. If you are experiencing connectivity issues:
              </p>
              <ul>
                <li>
                  <strong>VPN Required</strong> — Some features may require
                  you to be connected to the company VPN. Ensure your VPN
                  client is active and connected.
                </li>
                <li>
                  <strong>Wi-Fi vs. Mobile Data</strong> — Try switching
                  between Wi-Fi and mobile data to determine if the issue
                  is network-specific.
                </li>
                <li>
                  <strong>Firewall Restrictions</strong> — If you are on a
                  restricted network (e.g., hotel or public Wi-Fi), certain
                  ports required by the app may be blocked. Use the company
                  VPN to bypass restrictions.
                </li>
              </ul>
            </SupportSection>

            {/* Section 6 */}
            <SupportSection number="6" title="Updating the App">
              <p>
                To ensure the best experience and access to the latest
                features, always keep {siteConfig.name} up to date:
              </p>
              <ul>
                <li>
                  <strong>How to Update</strong> — Download the latest APK
                  ({siteConfig.apkName}) from the official portal and
                  install it over the existing version. Your data will be
                  preserved.
                </li>
                <li>
                  <strong>Version Check</strong> — You can verify your
                  current version from within the app under{" "}
                  <em>Settings → About</em>. The latest version is{" "}
                  <strong>{siteConfig.version}</strong>.
                </li>
                <li>
                  <strong>Forced Update</strong> — If you see a message
                  requiring you to update, you must install the new version
                  to continue using the app.
                </li>
              </ul>
            </SupportSection>

            {/* Section 7 */}
            <SupportSection number="7" title="Data & Security Concerns">
              <p>
                If you have concerns about data security or suspect
                unauthorized access:
              </p>
              <ul>
                <li>
                  <strong>Suspicious Activity</strong> — If you notice any
                  unfamiliar transactions, approvals, or changes in your
                  account, report it to the IT security team immediately.
                </li>
                <li>
                  <strong>Lost or Stolen Device</strong> — If your device
                  is lost or stolen, contact IT immediately so your account
                  can be remotely deactivated.
                </li>
                <li>
                  <strong>Data Privacy</strong> — For questions about how
                  your data is handled, refer to our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-primary hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>
                  .
                </li>
              </ul>
            </SupportSection>

            {/* Section 8 */}
            <SupportSection number="8" title="Contact IT Support">
              <p>
                If you were unable to resolve your issue using the guides
                above, please reach out to the IT support team directly.
                When contacting IT, please include:
              </p>
              <ul>
                <li>Your full name and employee ID.</li>
                <li>Your department and role.</li>
                <li>
                  A detailed description of the issue, including any error
                  messages or screenshots.
                </li>
                <li>
                  Your device model and Android version.
                </li>
                <li>
                  The version of {siteConfig.name} you are using (found
                  under <em>Settings → About</em>).
                </li>
              </ul>
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
                      Information Technology
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">
                      Support Hours
                    </span>
                    <span className="text-foreground font-medium">
                      Monday – Friday, 8:00 AM – 5:00 PM
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">
                      Response Time
                    </span>
                    <span className="text-foreground font-medium">
                      Within 24 business hours
                    </span>
                  </div>
                </div>
              </div>
            </SupportSection>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

/* ─── Quick Help Card Component ─── */

function QuickHelpCard({
  icon,
  title,
  description,
  sectionId,
}: {
  icon: string
  title: string
  description: string
  sectionId: string
}) {
  return (
    <a
      href={`#${sectionId}`}
      className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200"
    >
      <span className="text-2xl mb-3 block">{icon}</span>
      <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
    </a>
  )
}

/* ─── Reusable Section Component ─── */

function SupportSection({
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
