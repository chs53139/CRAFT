import Link from "next/link";

export function AppTopBar() {
  return (
    <header className="app-topbar">
      <Link href="/" className="app-logo group">
        <span className="app-logo-mark">CRAFT</span>
        <p className="app-logo-tagline">Your bar knows more than you think.</p>
      </Link>
    </header>
  );
}
