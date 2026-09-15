export const IDENTITY_METHOD = "self_declared" as const;
const IDENTITY_MAX_LENGTH = 100;

export type AgentIdentity = {
  provider: string | null;
  model: string | null;
  framework: string | null;
  version: string | null;
  identification_method: typeof IDENTITY_METHOD | null;
};

export function getIdentityLabel(identity: {
  provider?: string | null;
  model?: string | null;
  framework?: string | null;
  version?: string | null;
  identification_method?: string | null;
}) {
  const values = [identity.provider, identity.model, identity.framework, identity.version]
    .filter((value): value is string => Boolean(value));
  return values.length > 0 ? `${values.join(" · ")} · self-declared` : null;
}

type AgentIdentityInput = {
  provider?: unknown;
  model?: unknown;
  framework?: unknown;
  version?: unknown;
};

export function validateAgentIdentity(input: unknown): {
  identity?: AgentIdentity;
  error?: string;
} {
  if (input === undefined) {
    return { identity: emptyAgentIdentity() };
  }
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { error: "Agent identity must be an object." };
  }

  const values = input as AgentIdentityInput;
  const fields = ["provider", "model", "framework", "version"] as const;
  const normalized = Object.fromEntries(
    fields.map((field) => [field, normalizeIdentityValue(values[field])]),
  );
  if (Object.values(normalized).some((value) => value === undefined)) {
    return { error: "Agent identity fields must be text or null and 100 characters or fewer." };
  }

  const identityValues = normalized as Record<(typeof fields)[number], string | null>;
  const hasValue = Object.values(identityValues).some((value) => value !== null);
  return {
    identity: {
      ...identityValues,
      identification_method: hasValue ? IDENTITY_METHOD : null,
    },
  };
}

function normalizeIdentityValue(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim();
  if (normalized.length > IDENTITY_MAX_LENGTH) {
    return undefined;
  }
  return normalized || null;
}

function emptyAgentIdentity(): AgentIdentity {
  return {
    provider: null,
    model: null,
    framework: null,
    version: null,
    identification_method: null,
  };
}
