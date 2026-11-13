import { Suspense } from "react";
import { StudioDetails } from "@/components/studios/StudioDetails";
import { StudioDetailsSkeleton } from "@/components/studios/StudioDetailsSkeleton";

export default function StudioDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<StudioDetailsSkeleton />}>
      <StudioDetails params={params} />
    </Suspense>
  );
}
