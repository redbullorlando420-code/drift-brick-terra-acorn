import { useEffect, useState } from "react";
import {
  batchStatusAnnouncement,
  retainStatusAnnouncement,
  type BatchStatus,
  type StatusAnnouncement,
} from "@/lib/status-announcement";
/** Mount once before work starts so assistive technology observes semantic text changes. */
export function BatchStatusAnnouncement(props: BatchStatus) {
  const next = batchStatusAnnouncement(props);
  const [current, setCurrent] = useState<StatusAnnouncement>({ key: "", text: "" });
  useEffect(() => {
    setCurrent((previous) => retainStatusAnnouncement(previous, next));
  }, [next.key]);
  return (
    <p
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      data-batch-announcement={props.label}
    >
      {current.text}
    </p>
  );
}
