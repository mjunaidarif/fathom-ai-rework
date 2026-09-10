import { MeetingDetail } from "@/components/MeetingDetail";
import { MEETINGS } from "@/lib/seed";

export function generateStaticParams() {
  return MEETINGS.map((m) => ({ id: m.id }));
}

export default async function MeetingPage({ params }: PageProps<"/meeting/[id]">) {
  const { id } = await params;
  return <MeetingDetail id={id} />;
}
