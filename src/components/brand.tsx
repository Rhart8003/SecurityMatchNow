import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="SecurityMatch home">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 48 56" role="img">
          <path d="M24 2 43 9v15c0 13-8.2 23.5-19 30C13.2 47.5 5 37 5 24V9L24 2Z" fill="currentColor" opacity=".18"/>
          <path d="M24 5.5 40 11v13c0 10.8-6.4 20-16 26.1C14.4 44 8 34.8 8 24V11l16-5.5Z" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <path d="m16.5 26 5 5 10-11" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"/>
        </svg>
      </span>
      <span><strong>Security</strong>Match</span>
    </Link>
  );
}
