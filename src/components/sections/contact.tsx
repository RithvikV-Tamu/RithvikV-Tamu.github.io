import { ArrowUpRight, FileText, Mail } from "lucide-react"
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons"
import { SectionHeading } from "@/components/section-heading"
import { profile } from "@/content/site"

const currentYear = new Date().getFullYear()

export function Contact() {
  const links = [
    { label: "Email", href: profile.email ? `mailto:${profile.email}` : "", text: profile.email, Icon: Mail },
    { label: "LinkedIn", href: profile.linkedin, text: "LinkedIn profile", Icon: LinkedinIcon },
    { label: "GitHub", href: profile.github, text: "github.com/RithvikV-Tamu", Icon: GithubIcon },
    { label: "Resume", href: profile.resume, text: "Download PDF", Icon: FileText },
  ].filter((link) => link.href)

  return (
    <section id="contact" className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-40">
        <SectionHeading stageId="contact" title="Contact" />
        <ul className="grid max-w-2xl gap-3 sm:grid-cols-2">
          {links.map(({ label, href, text, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-atmosphere/40"
              >
                <Icon className="h-5 w-5 text-atmosphere" aria-hidden="true" />
                <span className="flex-1">
                  <span className="block font-mono text-xs tracking-wider text-muted-foreground uppercase">{label}</span>
                  <span className="block">{text}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Earth horizon glow returning at the end of the page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-20%] bottom-[-60%] h-[90%] rounded-[50%] bg-[radial-gradient(ellipse_at_top,#1b3a5c_0%,#0b1625_40%,transparent_70%)] shadow-[0_-2px_60px_rgba(121,185,234,0.25)]"
      />

      <footer className="relative mx-auto max-w-6xl px-6 pb-8 font-mono text-xs text-muted-foreground">
        © {currentYear} {profile.name}
      </footer>
    </section>
  )
}
