import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="SecurityMatch home">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 56 64" role="img">
          <defs>
            <linearGradient id="smGold" x1="8" y1="4" x2="47" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f2d675"/>
              <stop offset=".52" stopColor="#d4af37"/>
              <stop offset="1" stopColor="#9f7f18"/>
            </linearGradient>
            <linearGradient id="smRed" x1="19" y1="18" x2="38" y2="45" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff4056"/>
              <stop offset="1" stopColor="#b80e29"/>
            </linearGradient>
          </defs>

          <path
            d="M28 3.5 49 11v17.2c0 14.1-8.9 25.8-21 32.3C15.9 54 7 42.3 7 28.2V11L28 3.5Z"
            fill="#0d0d0f"
            stroke="url(#smGold)"
            strokeWidth="2.4"
          />
          <path
            d="M28 9.4 43.5 15v13.1c0 10.5-6.2 19.4-15.5 24.9-9.3-5.5-15.5-14.4-15.5-24.9V15L28 9.4Z"
            fill="rgba(212,175,55,.04)"
            stroke="rgba(212,175,55,.22)"
            strokeWidth="1"
          />

          <path
            d="M18 23.2 27.7 31 38 22.5"
            fill="none"
            stroke="url(#smGold)"
            strokeWidth="3.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27.7 31v10.4"
            fill="none"
            stroke="url(#smRed)"
            strokeWidth="3.1"
            strokeLinecap="round"
          />

          <circle cx="18" cy="23.2" r="3.2" fill="#0d0d0f" stroke="#f2d675" strokeWidth="1.8"/>
          <circle cx="38" cy="22.5" r="3.2" fill="#0d0d0f" stroke="#f2d675" strokeWidth="1.8"/>
          <circle cx="27.7" cy="31" r="4.2" fill="url(#smRed)" stroke="#ff7182" strokeWidth="1"/>
          <circle cx="27.7" cy="41.4" r="2.6" fill="#d4af37"/>
        </svg>
      </span>

      <span className="brand-copy">
        <span className="brand-wordmark">
          <span className="brand-security">Security</span><span className="brand-match">Match</span>
        </span>
        <span className="brand-descriptor">PRIVATE SECURITY MARKETPLACE</span>
      </span>
    </Link>
  );
}
