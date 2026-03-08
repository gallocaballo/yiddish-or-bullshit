import Link from "next/link";

/**
 * Home page — entry point with Daily Challenge and Free Play options.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <main className="w-full max-w-md space-y-8 text-center">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-serif text-5xl font-normal tracking-tight text-text-primary sm:text-6xl">
            Bullshit
          </h1>
          <p className="text-lg text-text-secondary">
            Can you spot the fake headlines?
          </p>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-text-secondary">
          You&apos;ll see 5 headlines. For each one, decide if it&apos;s{" "}
          <span className="font-semibold text-real-green">Real</span> or{" "}
          <span className="font-semibold text-bs-red">Bullshit</span>, then set
          your confidence. Higher confidence on correct answers means more
          points.
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <Link
            href="/play?mode=daily"
            className="block w-full rounded-lg bg-text-primary px-6 py-4 text-center text-lg font-semibold text-bg-primary transition-opacity hover:opacity-90"
          >
            Daily Challenge
          </Link>
          <Link
            href="/play?mode=freeplay"
            className="block w-full rounded-lg border-2 border-border px-6 py-4 text-center text-lg font-semibold text-text-primary transition-colors hover:border-text-secondary"
          >
            Free Play
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-xs text-text-secondary">
          Everyone gets the same daily headlines. Come back tomorrow for a new
          set.
        </p>
      </main>
    </div>
  );
}
