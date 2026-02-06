const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="w-full scroll-mt-[var(--navigation-height)] bg-gradient-to-b from-blue-50 to-cyan-50 px-5 pb-20 pt-2 md:px-8 md:pt-3 lg:pb-24 lg:pt-4"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mx-auto max-w-[42rem] text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold text-blue-950 md:text-5xl">
            Start tracking in a few focused steps
          </h2>
          <p className="mt-4 text-base text-blue-900/80 md:text-lg">
            Set up once, then let your dashboard and Assistant keep your
            spending clear and actionable.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {howItWorksData.map((step, index) => (
            <article
              key={step.id}
              className="group rounded-2xl border border-blue-200 bg-gradient-to-b from-white to-blue-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-500">
                  Step {index + 1}
                </p>
                <span className="text-blue-300 transition group-hover:text-blue-600">
                  →
                </span>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-blue-950">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-blue-900/75">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const howItWorksData = [
  {
    id: 1,
    title: "Create your account",
    description:
      "Sign up with email or GitHub, choose your preferred currency, and start with a clean workspace.",
  },
  {
    id: 2,
    title: "Define budget limits",
    description:
      "Set practical limits by category so each rupee or dollar has a clear job.",
  },
  {
    id: 3,
    title: "Capture entries quickly",
    description:
      "Log expenses manually or use Assistant prompts to convert plain text into transaction-ready data.",
  },
  {
    id: 4,
    title: "Review your dashboard",
    description:
      "See trends, category breakdowns, and budget status in one place with real-time updates.",
  },
  {
    id: 5,
    title: "Adjust as life changes",
    description:
      "Move limits between categories, update recurring costs, and keep the plan aligned with reality.",
  },
  {
    id: 6,
    title: "Act on insights",
    description:
      "Use analytics and monthly reviews to make better spending and saving decisions each month.",
  },
];

export default HowItWorks;
