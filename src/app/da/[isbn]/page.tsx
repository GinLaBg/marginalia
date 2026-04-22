import { BookDetailPage } from "@/components/da/book-detail-page";

export default async function DAIndividualBookPage({
  params,
}: {
  params: Promise<{ isbn: string }>;
}) {
  const { isbn } = await params;

  return <BookDetailPage bookId={isbn} />;
}
