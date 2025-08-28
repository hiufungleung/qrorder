import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - QR Order",
  description: "Sign in to your restaurant dashboard"
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}