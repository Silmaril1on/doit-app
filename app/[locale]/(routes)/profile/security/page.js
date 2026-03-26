const SecurityPage = () => {
  return (
    <main className="min-h-screen bg-black px-3 py-6 sm:px-4 sm:py-10 text-white">
      <section className="mx-auto max-w-3xl relative bg-teal-400/10 backdrop-blur-lg overflow-hidden rounded-lg border border-teal-500/20 p-4 sm:p-6">
        <div className="absolute left-0 top-0 w-[40%] h-[30%] rounded-full bg-teal-500/40 blur-[80px]" />

        <p className="secondary text-xs sm:text-sm uppercase tracking-[0.22em] text-teal-300/75">
          My Profile
        </p>
        <h1 className="primary mt-2 text-3xl sm:text-5xl uppercase leading-none text-teal-500">
          Security
        </h1>

        <p className="secondary mt-6 text-sm text-white/40 relative z-10">
          Security settings coming soon.
        </p>
      </section>
    </main>
  );
};

export default SecurityPage;

