import Head from "next/head";
import Layout from "expensasaurus/components/layout/Layout";
import {
  ChatAlt2Icon,
  FireIcon,
  SearchIcon,
  TrendingUpIcon,
  UserGroupIcon,
} from "@heroicons/react/solid";

const posts = [
  {
    id: "post-1",
    title: "How do you track recurring subscriptions without noise?",
    excerpt:
      "Trying to keep a clean feed but also want reminders for subscriptions that renew. What workflows work best for you?",
    tags: ["Automation", "Subscriptions", "Habits"],
    upvotes: 128,
    comments: 34,
    views: "1.2k",
    time: "2h",
    author: "Aarav",
  },
  {
    id: "post-2",
    title: "Best way to split shared rent + utilities?",
    excerpt:
      "Roommates pay on different days. Do you log a single expense and split, or log individually?",
    tags: ["Housing", "Splits", "Utilities"],
    upvotes: 92,
    comments: 19,
    views: "840",
    time: "5h",
    author: "Nisha",
  },
  {
    id: "post-3",
    title: "Income tracking for irregular freelance payments",
    excerpt:
      "Looking for a clean structure for advances, partial payments, and final invoices.",
    tags: ["Income", "Freelance", "Templates"],
    upvotes: 76,
    comments: 12,
    views: "640",
    time: "1d",
    author: "Rohan",
  },
  {
    id: "post-4",
    title: "Weekly review ritual: what actually sticks?",
    excerpt:
      "How do you make a 10‑minute weekly review feel useful and not like a chore?",
    tags: ["Routines", "Review", "Mindset"],
    upvotes: 58,
    comments: 9,
    views: "510",
    time: "2d",
    author: "Meera",
  },
];

const topics = [
  { name: "Budgeting", posts: 214 },
  { name: "Income", posts: 142 },
  { name: "Savings", posts: 98 },
  { name: "Automation", posts: 87 },
  { name: "Travel", posts: 76 },
  { name: "Debt", posts: 61 },
];

const CommunityPage = () => {
  return (
    <Layout>
      <Head>
        <title>Expensasaurus - Community</title>
      </Head>
      <main className="relative mx-auto w-full max-w-[1200px] px-4 pb-12 pt-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute -bottom-28 left-0 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/60 bg-white/80 p-6 shadow-[0_35px_80px_-60px_rgba(15,23,42,0.65)] backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.35),transparent_55%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  <UserGroupIcon className="h-3.5 w-3.5 text-slate-500" />
                  Community
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
                  Discussions that make money feel simple
                </h1>
                <p className="mt-3 text-sm text-slate-600">
                  Ask questions, share workflows, and learn from real setups. Think
                  Reddit, but focused on personal finance habits.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900">
                  Start a discussion
                </button>
                <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.8)] transition hover:bg-slate-800">
                  Share a template
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-3 shadow-sm sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Search discussions, tags, or people"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900">
                  Latest
                </button>
                <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900">
                  Top
                </button>
                <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900">
                  Unanswered
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:border-slate-300"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    <FireIcon className="h-3 w-3" />
                    Trending
                  </span>
                  <span>by {post.author}</span>
                  <span>•</span>
                  <span>{post.time}</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-slate-900">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <TrendingUpIcon className="h-4 w-4" />
                    {post.upvotes} upvotes
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ChatAlt2Icon className="h-4 w-4" />
                    {post.comments} comments
                  </span>
                  <span>{post.views} views</span>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.4)]">
              <h3 className="text-sm font-semibold text-slate-900">
                Top topics
              </h3>
              <div className="mt-4 space-y-3">
                {topics.map((topic) => (
                  <div
                    key={topic.name}
                    className="flex items-center justify-between text-sm text-slate-600"
                  >
                    <span>{topic.name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                      {topic.posts}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-slate-900 p-5 text-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.7)]">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                Community starter
              </h3>
              <p className="mt-3 text-sm text-white/80">
                Share your workflow, templates, or best practices. The community
                will turn it into a public playbook.
              </p>
              <button className="mt-4 w-full rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/25">
                Post your first guide
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 text-sm text-slate-600 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.4)]">
              <h3 className="text-sm font-semibold text-slate-900">
                Community rules
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li>Be kind and specific.</li>
                <li>No promotional spam.</li>
                <li>Share real numbers only if comfortable.</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </Layout>
  );
};

export default CommunityPage;
