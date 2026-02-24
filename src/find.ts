import { basename } from 'path';
import * as readline from 'readline';
import { parseAddOptions, runAdd } from './add.ts';
import { DEFAULT_REGISTRY_SUBPATH, DEFAULT_REGISTRY_URL } from './constants.ts';
import { cleanupTempDir, cloneRepo } from './git.ts';
import { discoverSkills } from './skills.ts';
import { isRepoPrivate } from './source-parser.ts';
import { track } from './telemetry.ts';
import type { Skill } from './types.ts';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[38;5;102m';
const TEXT = '\x1b[38;5;145m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const YELLOW = '\x1b[33m';

// API endpoint for skills search
const SEARCH_API_BASE = process.env.SKILLS_API_URL || 'https://skills.sh';

function formatInstalls(count: number): string {
  if (!count || count <= 0) return '';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M installs`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K installs`;
  return `${count} install${count === 1 ? '' : 's'}`;
}

export interface SearchSkill {
  name: string;
  slug: string;
  source: string;
  installs: number;
}

export type FindMode = 'default' | 'global';

export interface DefaultRegistrySkillResult {
  kind: 'default';
  name: string;
  registryUrl: string;
}

interface ApiSkillResult extends SearchSkill {
  kind: 'api';
}

type FindResult = DefaultRegistrySkillResult | ApiSkillResult;

export interface ParsedFindArgs {
  mode: FindMode;
  query: string;
}

interface SearchProviders {
  searchDefaultRegistry: (query: string) => Promise<DefaultRegistrySkillResult[]>;
  searchSkillsAPI: (query: string) => Promise<SearchSkill[]>;
}

// Search via API
export async function searchSkillsAPI(query: string): Promise<SearchSkill[]> {
  try {
    const url = `${SEARCH_API_BASE}/api/search?q=${encodeURIComponent(query)}&limit=10`;
    const res = await fetch(url);

    if (!res.ok) return [];

    const data = (await res.json()) as {
      skills: Array<{
        id: string;
        name: string;
        installs: number;
        source: string;
      }>;
    };

    return data.skills.map((skill) => ({
      name: skill.name,
      slug: skill.id,
      source: skill.source || '',
      installs: skill.installs,
    }));
  } catch {
    return [];
  }
}

const DEFAULT_REGISTRY_BRANCH = 'main';
const DEFAULT_REGISTRY_SOURCE_LABEL = 'default registry';

let defaultRegistrySkillsCache: Skill[] | null = null;
let defaultRegistrySkillsPromise: Promise<Skill[]> | null = null;

export function matchesDefaultRegistrySkillName(skillName: string, query: string): boolean {
  return skillName.toLowerCase().includes(query.trim().toLowerCase());
}

export function buildDefaultRegistrySkillUrl(skillPath: string): string {
  const registryBase = DEFAULT_REGISTRY_URL.replace(/\.git$/, '');
  const skillDir = basename(skillPath);
  return `${registryBase}/tree/${DEFAULT_REGISTRY_BRANCH}/${DEFAULT_REGISTRY_SUBPATH}/${skillDir}`;
}

async function loadDefaultRegistrySkills(): Promise<Skill[]> {
  if (defaultRegistrySkillsCache) return defaultRegistrySkillsCache;
  if (!defaultRegistrySkillsPromise) {
    defaultRegistrySkillsPromise = (async () => {
      let tempDir: string | null = null;
      try {
        tempDir = await cloneRepo(DEFAULT_REGISTRY_URL);
        const skills = await discoverSkills(tempDir, DEFAULT_REGISTRY_SUBPATH);
        defaultRegistrySkillsCache = skills;
        return skills;
      } finally {
        if (tempDir) {
          await cleanupTempDir(tempDir).catch(() => {});
        }
      }
    })();
  }

  try {
    return await defaultRegistrySkillsPromise;
  } finally {
    defaultRegistrySkillsPromise = null;
  }
}

async function searchDefaultRegistry(query: string): Promise<DefaultRegistrySkillResult[]> {
  try {
    const skills = await loadDefaultRegistrySkills();
    const matches = skills.filter((skill) => matchesDefaultRegistrySkillName(skill.name, query));
    return matches.map((skill) => ({
      kind: 'default',
      name: skill.name,
      registryUrl: buildDefaultRegistrySkillUrl(skill.path),
    }));
  } catch {
    return [];
  }
}

export function parseFindArgs(args: string[]): ParsedFindArgs {
  let mode: FindMode = 'default';
  const queryParts: string[] = [];
  let parsingOptions = true;

  for (const arg of args) {
    if (parsingOptions && arg === '--') {
      parsingOptions = false;
      continue;
    }

    if (parsingOptions && (arg === '-g' || arg === '--global')) {
      mode = 'global';
      continue;
    }

    queryParts.push(arg);
  }

  return {
    mode,
    query: queryParts.join(' ').trim(),
  };
}

export async function searchSkillsByMode(
  query: string,
  mode: FindMode,
  providers: SearchProviders = { searchDefaultRegistry, searchSkillsAPI }
): Promise<{ defaultResults: DefaultRegistrySkillResult[]; apiResults: SearchSkill[] }> {
  if (mode === 'global') {
    const apiResults = await providers.searchSkillsAPI(query);
    return { defaultResults: [], apiResults };
  }

  const defaultResults = await providers.searchDefaultRegistry(query);
  return { defaultResults, apiResults: [] };
}

export function formatNonInteractiveResults(
  mode: FindMode,
  defaultResults: DefaultRegistrySkillResult[],
  apiResults: SearchSkill[]
): string[] {
  const lines: string[] = [];
  const hasDefault = mode === 'default' && defaultResults.length > 0;
  const hasApi = mode === 'global' && apiResults.length > 0;

  if (hasDefault) {
    lines.push(
      `${DIM}Install with${RESET} npx skills add <name>${DIM} (From default registry)${RESET}`
    );
    lines.push('');

    for (const skill of defaultResults) {
      lines.push(`${TEXT}${skill.name}${RESET}`);
      lines.push(`${DIM}└ ${skill.registryUrl}${RESET}`);
      lines.push('');
    }
  }

  if (hasApi) {
    lines.push(
      `${DIM}Install with${RESET} npx skills add <owner/repo@skill>${DIM} (From https://skills.sh)${RESET}`
    );
    lines.push('');

    for (const skill of apiResults.slice(0, 6)) {
      const pkg = skill.source || skill.slug;
      const installs = formatInstalls(skill.installs);
      const installsBadge = installs ? ` ${CYAN}${installs}${RESET}` : '';
      lines.push(`${TEXT}${pkg}@${skill.name}${RESET}${installsBadge}`);
      lines.push(`${DIM}└ https://skills.sh/${skill.slug}${RESET}`);
      lines.push('');
    }
  }

  return lines;
}

// ANSI escape codes for terminal control
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';
const CLEAR_DOWN = '\x1b[J';
const MOVE_UP = (n: number) => `\x1b[${n}A`;
const MOVE_TO_COL = (n: number) => `\x1b[${n}G`;

// Custom fzf-style search prompt using raw readline
async function runSearchPrompt(mode: FindMode, initialQuery = ''): Promise<FindResult | null> {
  let results: FindResult[] = [];
  let defaultResults: DefaultRegistrySkillResult[] = [];
  let apiResults: ApiSkillResult[] = [];
  let selectedIndex = 0;
  let query = initialQuery;
  let loading = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastRenderedLines = 0;

  // Enable raw mode for keypress events
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  // Setup readline for keypress events but don't let it echo
  readline.emitKeypressEvents(process.stdin);

  // Resume stdin to start receiving events
  process.stdin.resume();

  // Hide cursor during selection
  process.stdout.write(HIDE_CURSOR);

  function render(): void {
    // Move cursor up to overwrite previous render
    if (lastRenderedLines > 0) {
      process.stdout.write(MOVE_UP(lastRenderedLines) + MOVE_TO_COL(1));
    }

    // Clear from cursor to end of screen (removes ghost trails)
    process.stdout.write(CLEAR_DOWN);

    const lines: string[] = [];

    // Search input line with cursor
    const cursor = `${BOLD}_${RESET}`;
    lines.push(`${TEXT}Search skills:${RESET} ${query}${cursor}`);
    lines.push('');

    // Results - keep showing existing results while loading new ones
    const combinedResults = results;
    if (!query || query.length < 2) {
      lines.push(`${DIM}Start typing to search (min 2 chars)${RESET}`);
    } else if (combinedResults.length === 0 && loading) {
      lines.push(`${DIM}Searching...${RESET}`);
    } else if (combinedResults.length === 0) {
      lines.push(`${DIM}No skills found${RESET}`);
    } else {
      const maxVisible = 8;
      const visible = combinedResults.slice(0, maxVisible);

      if (mode === 'default') {
        lines.push(`${DIM}Default registry:${RESET}`);
        for (let i = 0; i < visible.length; i++) {
          const skill = visible[i] as DefaultRegistrySkillResult | undefined;
          if (!skill) break;
          const isSelected = i === selectedIndex;
          const arrow = isSelected ? `${BOLD}>${RESET}` : ' ';
          const name = isSelected ? `${BOLD}${skill.name}${RESET}` : `${TEXT}${skill.name}${RESET}`;
          const source = ` ${DIM}${DEFAULT_REGISTRY_SOURCE_LABEL}${RESET}`;
          const loadingIndicator = loading && i === 0 ? ` ${DIM}...${RESET}` : '';
          lines.push(`  ${arrow} ${name}${source}${loadingIndicator}`);
        }
      } else {
        lines.push(`${DIM}Global results (https://skills.sh):${RESET}`);
        for (let i = 0; i < visible.length; i++) {
          const skill = visible[i] as ApiSkillResult | undefined;
          if (!skill) break;
          const isSelected = i === selectedIndex;
          const arrow = isSelected ? `${BOLD}>${RESET}` : ' ';
          const name = isSelected ? `${BOLD}${skill.name}${RESET}` : `${TEXT}${skill.name}${RESET}`;
          const source = skill.source ? ` ${DIM}${skill.source}${RESET}` : '';
          const installs = formatInstalls(skill.installs);
          const installsBadge = installs ? ` ${CYAN}${installs}${RESET}` : '';
          const loadingIndicator = loading && i === 0 ? ` ${DIM}...${RESET}` : '';
          lines.push(`  ${arrow} ${name}${source}${installsBadge}${loadingIndicator}`);
        }
      }
    }

    lines.push('');
    lines.push(`${DIM}up/down navigate | enter select | esc cancel${RESET}`);

    // Write each line
    for (const line of lines) {
      process.stdout.write(line + '\n');
    }

    lastRenderedLines = lines.length;
  }

  function triggerSearch(q: string): void {
    // Always clear any pending debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    // Always reset loading state when starting a new search
    loading = false;

    if (!q || q.length < 2) {
      results = [];
      defaultResults = [];
      apiResults = [];
      selectedIndex = 0;
      render();
      return;
    }

    // Use API search for all queries (debounced)
    loading = true;
    render();

    // Adaptive debounce: shorter queries = longer wait (user still typing)
    // 2 chars: 250ms, 3 chars: 200ms, 4 chars: 150ms, 5+ chars: 150ms
    const debounceMs = Math.max(150, 350 - q.length * 50);

    debounceTimer = setTimeout(async () => {
      try {
        if (mode === 'default') {
          defaultResults = await searchDefaultRegistry(q);
          apiResults = [];
          results = [...defaultResults];
        } else {
          defaultResults = [];
          const apiResponse = await searchSkillsAPI(q);
          apiResults = apiResponse.map((skill) => ({ ...skill, kind: 'api' }));
          results = [...apiResults];
        }
        selectedIndex = 0;
      } catch {
        results = [];
        defaultResults = [];
        apiResults = [];
      } finally {
        loading = false;
        debounceTimer = null;
        render();
      }
    }, debounceMs);
  }

  // Trigger initial search if there's a query, then render
  if (initialQuery) {
    triggerSearch(initialQuery);
  }
  render();

  return new Promise((resolve) => {
    function cleanup(): void {
      process.stdin.removeListener('keypress', handleKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdout.write(SHOW_CURSOR);
      // Pause stdin to fully release it for child processes
      process.stdin.pause();
    }

    function handleKeypress(_ch: string | undefined, key: readline.Key): void {
      if (!key) return;

      if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        // Cancel
        cleanup();
        resolve(null);
        return;
      }

      if (key.name === 'return') {
        // Submit
        cleanup();
        resolve(results[selectedIndex] || null);
        return;
      }

      if (key.name === 'up') {
        selectedIndex = Math.max(0, selectedIndex - 1);
        render();
        return;
      }

      if (key.name === 'down') {
        selectedIndex = Math.min(Math.max(0, results.length - 1), selectedIndex + 1);
        render();
        return;
      }

      if (key.name === 'backspace') {
        if (query.length > 0) {
          query = query.slice(0, -1);
          triggerSearch(query);
        }
        return;
      }

      // Regular character input
      if (key.sequence && !key.ctrl && !key.meta && key.sequence.length === 1) {
        const char = key.sequence;
        if (char >= ' ' && char <= '~') {
          query += char;
          triggerSearch(query);
        }
      }
    }

    process.stdin.on('keypress', handleKeypress);
  });
}

// Parse owner/repo from a package string (for the find command)
function getOwnerRepoFromString(pkg: string): { owner: string; repo: string } | null {
  // Handle owner/repo or owner/repo@skill
  const atIndex = pkg.lastIndexOf('@');
  const repoPath = atIndex > 0 ? pkg.slice(0, atIndex) : pkg;
  const match = repoPath.match(/^([^/]+)\/([^/]+)$/);
  if (match) {
    return { owner: match[1]!, repo: match[2]! };
  }
  return null;
}

async function isRepoPublic(owner: string, repo: string): Promise<boolean> {
  const isPrivate = await isRepoPrivate(owner, repo);
  // Return true only if we know it's public (isPrivate === false)
  // Return false if private or unable to determine
  return isPrivate === false;
}

export async function runFind(args: string[]): Promise<void> {
  const { mode, query } = parseFindArgs(args);
  const isNonInteractive = !process.stdin.isTTY;
  const agentTip = `${DIM}Tip: if running in a coding agent, follow these steps:${RESET}
${DIM}  1) npx skills find [query]${RESET}
${DIM}  2) npx skills find -g [query]${RESET}
${DIM}  3) npx skills add <owner/repo@skill>${RESET}`;

  // Non-interactive mode: just print results and exit
  if (query) {
    const { defaultResults, apiResults } = await searchSkillsByMode(query, mode);
    const totalResults = defaultResults.length + apiResults.length;

    // Track telemetry for non-interactive search
    track({
      event: 'find',
      query,
      resultCount: String(totalResults),
    });

    if (totalResults === 0) {
      console.log(`${DIM}No skills found for "${query}"${RESET}`);
      return;
    }

    const lines = formatNonInteractiveResults(mode, defaultResults, apiResults);
    for (const line of lines) {
      console.log(line);
    }
    return;
  }

  // Interactive mode - show tip only if running non-interactively (likely in a coding agent)
  if (isNonInteractive) {
    console.log(agentTip);
    console.log();
  }
  const selected = await runSearchPrompt(mode);

  // Track telemetry for interactive search
  track({
    event: 'find',
    query: '',
    resultCount: selected ? '1' : '0',
    interactive: '1',
  });

  if (!selected) {
    console.log(`${DIM}Search cancelled${RESET}`);
    console.log();
    return;
  }

  // Use source (owner/repo) and skill name for installation
  const skillName = selected.name;
  const isDefaultRegistry = selected.kind === 'default';
  let pkg: string;
  if (isDefaultRegistry) {
    pkg = skillName;
  } else {
    pkg = selected.source || selected.slug;
  }

  console.log();
  console.log(`${TEXT}Installing ${BOLD}${skillName}${RESET} from ${DIM}${pkg}${RESET}...`);
  console.log();

  // Run add directly since we're in the same CLI
  const argsForAdd = isDefaultRegistry ? [pkg] : [pkg, '--skill', skillName];
  const { source, options } = parseAddOptions(argsForAdd);
  await runAdd(source, options);

  console.log();

  if (isDefaultRegistry) {
    console.log(`${DIM}View the skill at${RESET} ${TEXT}${selected.registryUrl}${RESET}`);
  } else {
    const info = getOwnerRepoFromString(pkg);
    if (info && (await isRepoPublic(info.owner, info.repo))) {
      console.log(
        `${DIM}View the skill at${RESET} ${TEXT}https://skills.sh/${selected.slug}${RESET}`
      );
    } else {
      console.log(`${DIM}Discover more skills at${RESET} ${TEXT}https://skills.sh${RESET}`);
    }
  }

  console.log();
}
