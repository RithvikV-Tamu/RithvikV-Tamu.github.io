import { useState } from "react"
import { ArrowUpRight, Check, Copy, FileText, Mail } from "lucide-react"
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons"
import { Photo } from "@/components/photo"
import { SectionHeading } from "@/components/section-heading"
import { profile, sectionIntros } from "@/content/site"

const currentYear = new Date().getFullYear()

const cardClass =
  "group flex h-full items-center gap-4 rounded-xl border border-white/15 bg-black/40 p-5 backdrop-blur-md transition-colors hover:border-atmosphere/50"

export function Contact() {
  const links = [
    { label: "LinkedIn", href: profile.linkedin, text: "linkedin.com/in/rithvik-vootukur", Icon: LinkedinIcon },
    { label: "GitHub", href: profile.github, text: "github.com/RithvikV-Tamu", Icon: GithubIcon },
    ...profile.resumes.map((resume) => ({ label: resume.label, href: resume.href, text: "Open PDF", Icon: FileText })),
  ].filter((link) => link.href)

  return (
    <section id="contact" className="relative flex min-h-[85svh] flex-col justify-end overflow-hidden">
      {/* Two F-22s flying head-on behind the closing section */}
      <Photo
        name="jet-headon"
        alt="Two F-22 Raptors flying head-on toward the camera above the clouds"
        className="absolute inset-0 h-full w-full object-cover object-[50%_35%]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background/55 to-background/85" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-40 pb-16">
        <SectionHeading stageId="contact" title="Contact" intro={sectionIntros.contact} />
        <ul className="grid max-w-3xl gap-3 sm:grid-cols-2">
          {profile.emails.map((email) => (
            <li key={email.address}>
              <EmailCard label={email.label} address={email.address} />
            </li>
          ))}
          {links.map(({ label, href, text, Icon }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noreferrer" className={cardClass}>
                <Icon className="h-5 w-5 shrink-0 text-atmosphere" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-xs tracking-wider text-muted-foreground uppercase">{label}</span>
                  <span className="block truncate">{text}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className="relative mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-2 px-6 pb-8 font-mono text-xs text-white/60">
        <span>
          © {currentYear} {profile.name}
        </span>
        <span className="text-white/40">Photo: U.S. Air Force, Tech. Sgt. Emerson Nunez. Not affiliated with the U.S. Air Force.</span>
      </footer>
    </section>
  )
}

// Email card: the address opens a new message; the button copies it.
function EmailCard({ label, address }: { label: string; address: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${address}`
    }
  }

  return (
    <div className={cardClass}>
      <Mail className="h-5 w-5 shrink-0 text-atmosphere" aria-hidden="true" />
      <a href={`mailto:${address}`} className="min-w-0 flex-1">
        <span className="block font-mono text-xs tracking-wider text-muted-foreground uppercase">{label}</span>
        <span className="block truncate hover:underline">{address}</span>
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? `Copied ${address}` : `Copy ${address}`}
        className="shrink-0 rounded-md border border-white/15 p-2 text-muted-foreground transition-colors hover:border-atmosphere/50 hover:text-foreground"
      >
        {copied ? <Check className="h-4 w-4 text-atmosphere" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  )
}
