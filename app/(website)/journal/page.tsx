import { JournalSection } from "@/components/website/journal-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { getLatestJournalArticles } from "@/lib/db/queries";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "The KFLORÉ Journal",
  description: "Floral stories, seasonal guides and inspiration from KFLORÉ.",
  path: "/journal",
});

export default async function JournalPage() {
  const articles = await getLatestJournalArticles(24);

  if (articles.length === 0) {
    return (
      <div className="container-kflore page-section">
        <SectionHeading eyebrow="FLORAL STORIES" title="The KFLORÉ Journal" className="mx-auto" description="New stories are on their way." />
      </div>
    );
  }

  return <JournalSection articles={articles} />;
}
