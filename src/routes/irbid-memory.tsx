import { createFileRoute, Link } from "@tanstack/react-router";
import { PLAYLIST_URL, SITE_URL, episodeSlugs, faq, siteKeywords, themes, topicEpisodes } from "@/lib/seo-topics";

const TITLE = "ذاكرة إربد · مهن وأماكن وحكايات أهلها | ناس إربد";
const DESC =
  "دليل لذاكرة إربد القديمة من حلقات ناس إربد: مخبز حارة البارحة، العطارة في شارع الهاشمي، مقهى الكمال، سينما الزهراء، ديوان التل، الدحنون والتمر الهندي وحكايات الناس.";

export const Route = createFileRoute("/irbid-memory")({
  component: IrbidMemoryPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: siteKeywords.join("، ") },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/irbid-memory` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/irbid-memory` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "FAQPage",
              mainEntity: faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
            {
              "@type": "ItemList",
              name: "حلقات ناس إربد",
              itemListElement: topicEpisodes.map((e, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: episodeSlugs[e.youtubeId] ? `${SITE_URL}/episodes/${episodeSlugs[e.youtubeId]}` : `https://www.youtube.com/watch?v=${e.youtubeId}`,
                name: e.title,
              })),
            },
          ],
        }),
      },
    ],
  }),
});

function IrbidMemoryPage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-20">
      <header className="mb-14 text-center">
        <h1 className="font-display text-4xl leading-[1.6] text-foreground md:text-5xl">
          ذاكرة إربد: مهن وأماكن وحكايات أهلها
        </h1>
        <p className="mx-auto mt-5 max-w-2xl leading-loose text-muted-foreground">
          ناس إربد برنامج وثائقي يوثّق المدينة بصوت أهلها: من مخبز في حارة البارحة، إلى عطّار في شارع الهاشمي،
          ومقهى الكمال، وسينما الزهراء، وديوان عشائري، ومحل تراث. هنا خلاصة ما قيل في حلقاتنا.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/episodes" className="rounded-full bg-gradient-warm px-7 py-3 font-bold text-primary-foreground shadow-glow">
            أرشيف الحلقات
          </Link>
          <Link to="/map" className="rounded-full border-2 border-primary/40 px-7 py-3 font-bold text-foreground hover:bg-primary/10">
            خريطة الحكايات
          </Link>
        </div>
      </header>

      {themes.map((theme) => {
        const items = topicEpisodes.filter((e) => e.theme === theme);
        if (!items.length) return null;
        return (
          <section key={theme} className="mb-14">
            <h2 className="mb-6 font-display text-3xl leading-[1.6] text-foreground">{theme} في إربد</h2>
            <div className="space-y-8">
              {items.map((e) => (
                <article key={e.youtubeId} className="rounded-2xl border border-border/60 p-6">
                  <h3 className="font-display text-2xl leading-[1.7] text-foreground">{e.title}</h3>
                  <p className="mt-3 leading-loose text-muted-foreground">{e.summary}</p>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="كلمات مفتاحية">
                    {e.keywords.map((k) => (
                      <li key={k} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                        {k}
                      </li>
                    ))}
                  </ul>
                  {episodeSlugs[e.youtubeId] ? (
                    <Link
                      to="/episodes/$slug"
                      params={{ slug: episodeSlugs[e.youtubeId] }}
                      className="mt-4 inline-block font-bold text-primary hover:underline"
                    >
                      صفحة الحلقة
                    </Link>
                  ) : (
                    <a
                      href={`https://www.youtube.com/watch?v=${e.youtubeId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block font-bold text-primary hover:underline"
                    >
                      شاهد الحلقة على يوتيوب
                    </a>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mb-14">
        <h2 className="mb-6 font-display text-3xl leading-[1.6] text-foreground">أسئلة شائعة عن ناس إربد</h2>
        <dl className="space-y-6">
          {faq.map((f) => (
            <div key={f.q}>
              <dt className="font-bold text-foreground">{f.q}</dt>
              <dd className="mt-2 leading-loose text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="text-center text-muted-foreground">
        كل الحلقات على{" "}
        <a href={PLAYLIST_URL} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline">
          قائمة تشغيل ناس إربد في يوتيوب
        </a>
        .
      </p>
    </div>
  );
}
