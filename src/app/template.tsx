"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

export default function RootTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-fade-up">
      {children}
    </div>
  );
}
