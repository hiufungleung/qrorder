import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Menu - QR Order",
  description: "Browse menu and place your order"
};

export default function OrderingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}