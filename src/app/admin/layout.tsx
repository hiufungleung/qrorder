import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - QR Order",
  description: "System administration and restaurant management"
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}