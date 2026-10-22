import Link from "next/link";
import { Wordmark } from "./wordmark";
import { Container } from "./ui";

/** Slim header for public pages outside the signed-in app (e.g. certificate verification). */
export function PublicHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="border-b border-border bg-surface no-print">
      <Container className="flex h-16 items-center gap-6">
        <Link href="/" aria-label="Nexsademy home">
          <Wordmark />
        </Link>
        <nav className="ml-auto flex items-center gap-5 text-sm" aria-label="Main">
          <Link href="/verify" className="hidden text-fg hover:text-primary sm:inline">
            Verify a certificate
          </Link>
          {signedIn ? (
            <Link href="/dashboard" className="rounded-md bg-[#0b1b3f] px-4 py-2 font-semibold text-white hover:bg-[#13285a]">
              My learning
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-fg hover:text-primary">
                Log in
              </Link>
              <Link href="/register" className="rounded-md bg-[#0b1b3f] px-4 py-2 font-semibold text-white hover:bg-[#13285a]">
                Sign up free
              </Link>
            </>
          )}
        </nav>
      </Container>
    </header>
  );
}
