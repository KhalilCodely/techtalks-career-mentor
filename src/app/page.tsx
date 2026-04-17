import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-slate-950 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-12 rounded-[2rem] border border-zinc-200 bg-white p-10 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.25)] dark:border-zinc-800 dark:bg-zinc-900 lg:p-14">
        <section className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-600">
            Career Mentor
          </p>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Secure login for your mentor workspace
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
              Choose an entry point to continue.
            </p>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/signup"
            className="group rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8 text-left transition duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-sky-500"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
                  New here
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">
                  Sign up
                </h2>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 transition group-hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-200">
                →
              </span>
            </div>
            <p className="mt-5 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              Create an account and start using the platform with secure
              storage.
            </p>
          </Link>

          <Link
            href="/login"
            className="group rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8 text-left transition duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                  Returning user
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">
                  Log in
                </h2>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-slate-950 transition group-hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white">
                →
              </span>
            </div>
            <p className="mt-5 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              Access your dashboard and continue where you left off.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
