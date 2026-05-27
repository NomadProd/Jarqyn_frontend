"use client";

import { DemoProvider } from "@/components/demo-provider";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      {children}
      <SiteFooter />
      <WhatsAppFloat />
    </DemoProvider>
  );
}
