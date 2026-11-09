import { useEffect } from "react"
import { ArrowUpRight, Hash, Rocket } from "lucide-react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { featured, moreWork, profile, stages } from "@/content/site"

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Ctrl+K (or Cmd+K) palette for jumping to any section or project.
export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  function goTo(id: string) {
    onOpenChange(false)
    document.getElementById(id)?.scrollIntoView()
  }

  function openLink(url: string) {
    onOpenChange(false)
    if (url.startsWith("mailto:")) window.location.href = url
    else window.open(url, "_blank", "noreferrer")
  }

  const links = [
    ...profile.resumes.map((resume) => ({ label: resume.label, url: resume.href })),
    ...profile.emails.map((email) => ({ label: `Email ${email.address}`, url: `mailto:${email.address}` })),
    { label: "GitHub profile", url: profile.github },
    { label: "LinkedIn", url: profile.linkedin },
    ...moreWork.filter((item) => item.href).map((item) => ({ label: `${item.name} code`, url: item.href! })),
  ].filter((link) => link.url)

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Jump To" description="Search sections, projects and links">
      <Command>
        <CommandInput placeholder="Search sections, projects and links..." />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Sections">
            {stages.map((stage) => (
              <CommandItem key={stage.id} onSelect={() => goTo(stage.id)}>
                <Hash />
                {stage.nav}
                <span className="ml-auto font-mono text-xs text-muted-foreground">{stage.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Featured projects">
            {featured.map((project) => (
              <CommandItem key={project.id} onSelect={() => goTo(project.id)}>
                <Rocket />
                {project.title}
              </CommandItem>
            ))}
          </CommandGroup>
          {links.length > 0 && (
            <CommandGroup heading="Links">
              {links.map((link) => (
                <CommandItem key={link.url} onSelect={() => openLink(link.url)}>
                  <ArrowUpRight />
                  {link.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
