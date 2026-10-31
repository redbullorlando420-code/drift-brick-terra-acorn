import { useEffect, useState } from "react";
import { companionHealth, type CompanionHealth } from "@/lib/companion";
import { negotiateCompanion, type CompanionFeature } from "@/lib/companion-protocol";
/** One coalesced probe per mounted panel; explicit refresh, never polling. */
export function useCompanionSupport() {
  const [health, setHealth] = useState<CompanionHealth | null>(null),
    [checked, setChecked] = useState(false),
    [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setChecked(false);
    void companionHealth(refresh > 0).then((value) => {
      if (active) {
        setHealth(value);
        setChecked(true);
      }
    });
    return () => {
      active = false;
    };
  }, [refresh]);
  const negotiation = negotiateCompanion(health);
  return {
    health,
    checked,
    can: (feature: CompanionFeature) =>
      checked && negotiation.compatible && negotiation.capabilities.includes(feature),
    refresh: () => setRefresh((n) => n + 1),
    note: !checked
      ? "Checking local Companion support…"
      : !negotiation.compatible
        ? "Companion is unavailable. Browser games and local file import remain usable."
        : health?.platform?.schema === 1
          ? health.platform.note
          : "This Companion has no platform contract. Features use its advertised legacy capabilities; native platform behavior is unverified.",
  };
}
