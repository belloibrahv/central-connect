import IssueForm from "@/components/IssueForm";
import { prisma } from "@/lib/prisma";

export default async function IssuesPage() {
  const hostels = await prisma.hostel.findMany({
    select: { id: true, name: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Report an issue</h1>
        <p className="text-sm text-ink/70">Tell us what is wrong and where it is.</p>
      </div>
      <IssueForm hostels={hostels} />
    </div>
  );
}
