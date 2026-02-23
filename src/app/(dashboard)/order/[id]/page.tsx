import DetailOrder from "./_components/detail-order";

export const metadata = {
  title: "Cafe APP | Detail Order",
};

export default async function DetailOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetailOrder id={id} />;
}
