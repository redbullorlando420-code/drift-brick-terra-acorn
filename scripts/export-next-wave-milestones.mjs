import { writeFileSync } from "node:fs";
import { NEXT_WAVE_MISSIONS } from "../src/lib/mission-next-wave.ts";
import { ALL_NEXT_LEVEL_MISSIONS } from "../src/lib/mission-roadmap.ts";
import { formatNextLevelRoadmap } from "../src/lib/mission-next-level.ts";

writeFileSync(
  new URL("../NEXT_100_MILESTONES.md", import.meta.url),
  formatNextLevelRoadmap(NEXT_WAVE_MISSIONS, ALL_NEXT_LEVEL_MISSIONS),
);
writeFileSync(
  new URL("../ROADMAP_200_MILESTONES.md", import.meta.url),
  formatNextLevelRoadmap(ALL_NEXT_LEVEL_MISSIONS),
);
console.log(
  "Wrote the new 100 briefs and the combined 200-milestone roadmap with evidenced source statuses.",
);
