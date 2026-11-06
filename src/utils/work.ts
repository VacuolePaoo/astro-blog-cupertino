import type { WorkEntry } from '../types/work'
import { getCollection } from 'astro:content'

/** All published works, ordered deterministically by file id. */
export async function getWorks(): Promise<WorkEntry[]> {
	const works = await getCollection('works', ({ data }) => !data.draft)
	return works.sort((a, b) => a.id.localeCompare(b.id))
}

/** Stable DOM identifier for a work, derived from its content id. */
export function getWorkDomId(work: WorkEntry): string {
	return `work-${work.id.replace(/[^a-z0-9-]/gi, '-')}`
}
