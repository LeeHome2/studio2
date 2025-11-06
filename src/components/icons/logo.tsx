export function Logo() {
  return (
    <div className="flex items-center gap-2.5" aria-label="KeyChainify Logo">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7 text-glow-primary"
        aria-hidden="true"
      >
        <path d="M15.5 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M12 12H2" />
        <path d="m6 6 2-2" />
        <path d="m6 18 2 2" />
      </svg>
      <span className="font-headline text-2xl font-bold tracking-tighter text-foreground">
        KeyChainify
      </span>
    </div>
  );
}
