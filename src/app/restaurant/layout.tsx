import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurant Dashboard - QR Order",
  description: "Manage your restaurant menu, tables, and orders"
};

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}