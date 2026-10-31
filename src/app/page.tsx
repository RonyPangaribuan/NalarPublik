export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-2xl rounded-2xl border bg-card p-8 shadow-sm sm:p-12">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Setup awal selesai
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          NalarPublik
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
          Fondasi proyek sudah siap. Implementasi fitur akan dibangun di atas
          Next.js, TypeScript, Tailwind CSS, dan shadcn/ui.
        </p>
      </section>
    </main>
  );
}
