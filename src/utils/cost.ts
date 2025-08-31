export interface CostRates {
  inputPer1k: number; // USD per 1K input tokens
  outputPer1k: number; // USD per 1K output tokens
}

function normalizeModel(model: string): string {
  return model.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase();
}

function readNumberEnv(name: string): number | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export function getCostRates(model: string): CostRates {
  // Global overrides
  const both = readNumberEnv('GROK_COST_PER_1K');
  const input = readNumberEnv('GROK_COST_INPUT_PER_1K');
  const output = readNumberEnv('GROK_COST_OUTPUT_PER_1K');

  // Model-specific overrides (e.g., GROK_COST_GROK_4_LATEST_INPUT_PER_1K)
  const key = normalizeModel(model);
  const mInput = readNumberEnv(`GROK_COST_${key}_INPUT_PER_1K`);
  const mOutput = readNumberEnv(`GROK_COST_${key}_OUTPUT_PER_1K`);
  const mBoth = readNumberEnv(`GROK_COST_${key}_PER_1K`);

  const inputPer1k = mInput ?? input ?? mBoth ?? both ?? 0;
  const outputPer1k = mOutput ?? output ?? mBoth ?? both ?? 0;

  return { inputPer1k, outputPer1k };
}

export function estimateCostUSD(tokensIn: number, tokensOut: number, rates: CostRates): number {
  const costIn = (tokensIn / 1000) * rates.inputPer1k;
  const costOut = (tokensOut / 1000) * rates.outputPer1k;
  return +(costIn + costOut).toFixed(6);
}

export function getMaxBudgetUSD(): number | undefined {
  const raw = process.env.GROK_MAX_BUDGET_USD;
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function formatUSD(n: number): string {
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

