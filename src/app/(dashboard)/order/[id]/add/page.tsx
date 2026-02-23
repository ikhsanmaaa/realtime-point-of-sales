import AddOrderItem from "./_components/add-order-item";

export const metadata = {
  title: "Cafe APP | Detail Order",
};

export default async function DetailOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AddOrderItem id={id} />;
}
