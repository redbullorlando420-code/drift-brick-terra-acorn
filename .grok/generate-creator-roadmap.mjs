import {writeFile} from 'node:fs/promises';
import {formatNextLevelRoadmap} from '../src/lib/mission-next-level.ts';
await writeFile(new URL('../NEXT_LEVEL_MILESTONES.md',import.meta.url),formatNextLevelRoadmap());
