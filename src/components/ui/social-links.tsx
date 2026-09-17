import { siteConfig } from "@/config/site";

type SocialLinksProps = {
  className?: string;
  compact?: boolean;
};

export function SocialLinks({ className = "", compact = false }: SocialLinksProps) {
  const hit = compact ? "h-8 w-8" : "h-10 w-10";
  const icon = compact ? "h-4 w-4" : "h-5 w-5";

  return (
    <nav aria-label="Redes sociais" className={className}>
      <ul className="flex items-center gap-0.5">
        <li>
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram @projeto.astarte"
            className={`flex ${hit} items-center justify-center rounded-full transition-colors hover:text-dourado`}
          >
            <InstagramIcon className={icon} />
          </a>
        </li>
        <li>
          <a
            href={siteConfig.social.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok @projetoastarte"
            className={`flex ${hit} items-center justify-center rounded-full transition-colors hover:text-dourado`}
          >
            <TikTokIcon className={icon} />
          </a>
        </li>
      </ul>
    </nav>
  );
}

function InstagramIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.52.69 2.89 2.89 0 0 1 2.24-3.46V9.4a6.34 6.34 0 0 0-1-.08A6.34 6.34 0 0 0 2.75 15.66 6.34 6.34 0 0 0 9.09 22a6.34 6.34 0 0 0 6.34-6.34V8.73a8.16 8.16 0 0 0 4.76 1.52V6.9a4.89 4.89 0 0 1-.6-.21Z" />
    </svg>
  );
}
