import { siteConfig } from "@/config/site";

export const installSteps = [
  {
    number: 1,
    title: "Download the APK",
    description: (
      <>
        Click the &quot;Download Enterprise APK&quot; button above. The file{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs">{siteConfig.apkName}</code>{" "}
        will be saved to your device.
      </>
    ),
  },
  {
    number: 2,
    title: "Allow Unknown Sources",
    description: (
      <>
        When prompted, go to <strong>Settings &gt; Security</strong> and enable
        &quot;Install from Unknown Sources&quot; for your browser or file manager.
      </>
    ),
  },
  {
    number: 3,
    title: "Install & Open",
    description:
      'Open the downloaded file from your notification bar or Downloads folder and tap "Install".',
  },
  {
    number: 4,
    title: "Log In",
    description: (
      <>
        Use your {siteConfig.shortCompanyName} corporate credentials to sign in.{" "}
        <a href="#" className="text-primary hover:underline">
          Forgot password?
        </a>
      </>
    ),
  },
];
