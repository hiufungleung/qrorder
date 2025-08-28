import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Restaurant - QR Order Admin",
  description: "Create a new restaurant account"
};

export default function CreateRestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}