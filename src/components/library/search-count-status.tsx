import { useEffect, useState } from "react";
import { describeSearchCount, type SearchCountEvidence } from "@/lib/videos/search-count-evidence";
import { searchWorkerIndex } from "@/lib/videos/search-worker-index";
import { parseSearchQuery } from "@/lib/videos/search-query";
export function SearchCountStatus({
  pending,
  count,
  query,
}: {
  pending: boolean;
  count: number;
  query: string;
}) {
  const [status, setStatus] = useState(searchWorkerIndex.getStatus());
  useEffect(() => {
    if (!pending) return;
    setStatus(searchWorkerIndex.getStatus());
    return searchWorkerIndex.subscribe(setStatus);
  }, [pending]);
  const invalid = Boolean(parseSearchQuery(query).error);
  const evidence: SearchCountEvidence = {
    version: 1,
    kind: invalid ? "unavailable" : pending ? "pending" : "snapshot",
    value: pending || invalid ? undefined : count,
    scope: "saved catalog",
    complete: !pending && !invalid,
  };
  return <CountEvidenceLabel evidence={evidence} building={pending && status === "building"} />;
}
export function CountEvidenceLabel({
  evidence,
  building = false,
}: {
  evidence: SearchCountEvidence;
  building?: boolean;
}) {
  const label = describeSearchCount(evidence);
  return (
    <div
      aria-label="Search count evidence"
      className="mb-4 rounded-lg border border-border bg-surface p-3 text-xs text-muted"
      data-count-kind={evidence.kind}
    >
      <p className="font-medium text-fg" role="status">
        {label.label}
      </p>
      <p className="mt-1 leading-5">
        {label.detail}
        {building ? " The search index is being prepared in batches." : ""}
      </p>
    </div>
  );
}
