import { ArrowUpRight, FileText, Mail } from "lucide-react"
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons"
import { Photo } from "@/components/photo"
import { SectionHeading } from "@/components/section-heading"
import { profile, sectionIntros } from "@/content/site"

const currentYear = new Date().getFullYear()

export function Contact() {
  const links = [
    { label: "Email", href: profile.email ? `mailto:${profile.email}` : "", text: profile.email, Icon: Mail },
    { label: "LinkedIn", href: profile.linkedin, text: "LinkedIn profile", Icon: LinkedinIcon },
    { label: "GitHub", href: profile.github, text: "github.com/RithvikV-Tamu", Icon: GithubIcon },
    { label: "Resume", href: profile.resume, text: "Download PDF", Icon: FileText },
  ].filter((link) => link.href)

  return (
    <section id="contact" className="relative flex min-h-[85svh] flex-col justify-end overflow-hidden">
      {/* Orbital sunrise behind the closing section */}
      <Photo
        name="orbit-sunrise"
        alt="Sunrise over Earth's horizon seen from the International Space Station"
        className="absolute inset-0 h-full w-full object-cover object-[20%_50%]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background/70" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-40 pb-16">
        <SectionHeading stageId="contact" title="Contact" intro={sectionIntros.contact} />
        <ul className="grid max-w-2xl gap-3 sm:grid-cols-2">
          {links.map(({ label, href, text, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="group flex items-center gap-4 rounded-xl border border-white/15 bg-black/40 p-5 backdrop-blur-md transition-colors hover:border-atmosphere/50"
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

      <footer className="relative mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-2 px-6 pb-8 font-mono text-xs text-white/60">
        <span>
          © {currentYear} {profile.name}
        </span>
        <span className="text-white/40">Photo: NASA (ISS Expedition 73). Not affiliated with NASA.</span>
      </footer>
    </section>
  )
}
