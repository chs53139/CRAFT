import Link from "next/link";

export function AppTopBar() {
  return (
    <header className="app-topbar">
      <Link href="/" className="app-header-wordmark">
        CRAFT
      </Link>
    </header>
  );
}
