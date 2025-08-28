import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Status - QR Order",
  description: "Track your order status"
};

export default function OrderStatusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}