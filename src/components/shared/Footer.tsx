import * as React from "react"
import Link from "next/link"
import { Globe, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full py-12 px-6 grid grid-cols-1 md:grid-cols-4 gap-8 bg-surface-container-lowest border-t border-white/5">
      <div className="col-span-1">
        <span className="font-label-caps text-xs text-primary mb-6 block uppercase tracking-widest">NexaCargo Global</span>
        <p className="font-body-sm text-sm text-on-surface-variant max-w-xs mb-8">
          Redefining the logistics landscape through technological excellence and global integrity.
        </p>
        <div className="flex gap-6">
          <Link href="#" className="text-on-surface-variant hover:text-tertiary transition-colors">
            <Globe className="w-5 h-5" />
          </Link>
          <Link href="#" className="text-on-surface-variant hover:text-tertiary transition-colors">
            <Mail className="w-5 h-5" />
          </Link>
          <Link href="#" className="text-on-surface-variant hover:text-tertiary transition-colors">
            <Phone className="w-5 h-5" />
          </Link>
        </div>
      </div>
      <div>
        <h5 className="font-title-md text-xl text-on-surface mb-6 font-semibold">Company</h5>
        <ul className="space-y-4">
          <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/privacy-policy">Privacy Policy</Link></li>
          <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/terms-of-service">Terms of Service</Link></li>
          <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/careers">Careers</Link></li>
          <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/press-kit">Press Kit</Link></li>
        </ul>
      </div>
      <div>
        <h5 className="font-title-md text-xl text-on-surface mb-6 font-semibold">Network</h5>
        <ul className="space-y-4">
          <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/global-offices">Global Offices</Link></li>
          <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/warehouse-network">Warehouse Network</Link></li>
          <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/customs-hubs">Customs Hubs</Link></li>
          <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/partners">Partners</Link></li>
        </ul>
      </div>
      <div>
        <h5 className="font-title-md text-xl text-on-surface mb-6 font-semibold">Support</h5>
        <ul className="space-y-4">
          <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/contact">Contact</Link></li>
          <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="#">Help Center</Link></li>
          <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/track">Track Status</Link></li>
          <li><Link className="font-body-sm text-sm text-on-surface-variant hover:text-tertiary transition-colors" href="/freight-quote">Request Quote</Link></li>
        </ul>
      </div>
      <div className="col-span-1 md:col-span-4 pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <span className="font-body-sm text-sm text-on-surface-variant">© 2026 NexaCargo Global Logistics. All rights reserved.</span>
        <div className="flex gap-8">
          <span className="font-label-caps text-[10px] text-on-surface-variant/30 uppercase tracking-widest">ISO 9001:2015 CERTIFIED</span>
          <span className="font-label-caps text-[10px] text-on-surface-variant/30 uppercase tracking-widest">GDPR COMPLIANT</span>
        </div>
      </div>
    </footer>
  )
}
