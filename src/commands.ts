import { readdir, stat, readFile } from 'fs/promises';
import { join, basename, extname } from 'path';
import type { Skill } from './types.ts';
import matter from 'gray-matter';

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', '__pycache__'];
const SKIP_FILES = new Set(['README.md', 'SKILL.md', 'metadata.json']);

export interface DiscoverCommandsOptions {
  /** Search all subdirectories even when a root command file exists */
  fullDepth?: boolean;
}

function isCommandFile(name: string): boolean {
  if (SKIP_FILES.has(name)) return false;
  if (name.startsWith('_')) return false;
  return extname(name).toLowerCase() === '.md';
}

async function findCommandFiles(dir: string, depth = 0, maxDepth = 5): Promise<string[]> {
  if (depth > maxDepth) return [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.includes(entry.name)) continue;
        files.push(...(await findCommandFiles(join(dir, entry.name), depth + 1, maxDepth)));
      } else if (entry.isFile() && isCommandFile(entry.name)) {
        files.push(join(dir, entry.name));
      }
    }

    return files;
  } catch {
    return [];
  }
}

export async function discoverCommands(
  basePath: string,
  subpath?: string,
  options?: DiscoverCommandsOptions
): Promise<Skill[]> {
  const commands: Skill[] = [];
  const seenNames = new Set<string>();
  const searchPath = subpath ? join(basePath, subpath) : basePath;
  const maxDepth = options?.fullDepth ? 25 : 5;

  const commandFiles = await findCommandFiles(searchPath, 0, maxDepth);

  for (const filePath of commandFiles) {
    const name = basename(filePath, '.md');
    if (!name) continue;
    const normalized = name.toLowerCase();
    if (seenNames.has(normalized)) continue;
    seenNames.add(normalized);
    let description = '';
    try {
      const content = await readFile(filePath, 'utf-8');
      const { data } = matter(content);
      if (typeof data.description === 'string') {
        description = data.description;
      }
    } catch {
      // Ignore parse errors; description stays empty
    }
    commands.push({
      name,
      description,
      path: filePath,
    });
  }

  return commands;
}

export function getCommandDisplayName(command: Skill): string {
  return command.name || basename(command.path, '.md');
}
