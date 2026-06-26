export type ResourceStatus = "operational" | "degraded" | "down";
export type TrustStatus = "unofficial" | "community" | "verified";

export type Resource = {
  id: string;
  name: string;
  url: string;
  category: string;
  summary: string;
  zone: string;
  tags: string[];
  status: ResourceStatus;
  trust: TrustStatus;
  clicks24h: number;
  clicks7d: number;
  createdAt: string;
  lastCheckedAt: string | null;
  lastManualReviewAt: string | null;
  responseMs: number | null;
  failureReason: string | null;
  consecutiveFailures: number;
};

export type ResourceInput = {
  name: string;
  url: string;
  category: string;
  summary: string;
  zone: string;
  contact: string;
  trustClaim: string;
  evidence: string;
  tags?: string[];
};

export type ValidationResult = {
  ok: boolean;
  normalizedUrl: string;
  status: ResourceStatus;
  responseMs: number | null;
  reason: string | null;
  pageTitle?: string | null;
  pageDescription?: string | null;
  pageText?: string | null;
};

export type ClassifiedResource = {
  name: string;
  category: string;
  summary: string;
  zone: string;
  tags: string[];
  confidence: number;
  source: "anthropic" | "openrouter" | "heuristic";
};
