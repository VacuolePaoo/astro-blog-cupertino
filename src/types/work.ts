import type { CollectionEntry } from 'astro:content'

export type WorkEntry = CollectionEntry<'works'>
export type WorkData = WorkEntry['data']
