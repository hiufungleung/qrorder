import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Orders - QR Order",
  description: "View and manage incoming orders"
};

export default function ManageOrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}