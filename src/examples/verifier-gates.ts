// Illustrative only. Every check below is a stand-in: no cryptography,
// no real issuer, no real credential format.
type DemoCheck = (request: DemoRequest) => string | null;

interface DemoRequest {
  purpose: string;
  allowedPurposes: ReadonlySet<string>;
  nonceSeen: boolean;
  issuerTrusted: boolean;
  credentialRevoked: boolean;
  requestedFields: string[];
  disclosableFields: ReadonlySet<string>;
}

const checks: DemoCheck[] = [
  (r) => r.allowedPurposes.has(r.purpose) ? null : "purpose not allowed",
  (r) => r.nonceSeen ? "nonce already used" : null,
  (r) => r.issuerTrusted ? null : "issuer not trusted",
  (r) => r.credentialRevoked ? "credential revoked" : null,
  (r) => r.requestedFields.every((f) => r.disclosableFields.has(f))
    ? null
    : "requested field not disclosable",
];

function verifyDemo(request: DemoRequest): string | null {
  for (const check of checks) {
    const failure = check(request);
    if (failure !== null) return failure;
  }
  return null;
}
