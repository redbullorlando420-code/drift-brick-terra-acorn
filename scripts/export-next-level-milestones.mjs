import {writeFileSync} from 'node:fs';
import {formatNextLevelRoadmap} from '../src/lib/mission-next-level.ts';
writeFileSync(new URL('../NEXT_LEVEL_MILESTONES.md',import.meta.url),formatNextLevelRoadmap());
console.log('Wrote 100 executable milestones to NEXT_LEVEL_MILESTONES.md');
