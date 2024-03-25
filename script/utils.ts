import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

export const resolvePath = (p: string, ...args: string[]) => resolve(fileURLToPath(new URL(p, import.meta.url)), ...args)
