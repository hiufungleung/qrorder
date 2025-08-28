import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - QR Order",
  description: "Create your restaurant account"
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}