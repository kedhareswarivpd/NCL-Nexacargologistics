import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal — NexaCargo",
  description: "Secure administrator access to the NexaCargo control centre.",
};

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
