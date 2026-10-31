// The signature flag below stands in for a cryptographic check.
type DemoCredential = {
  issuer: string;
  expiresAt: string;
  signatureVerifiedByMock: boolean;
};

function passesDemoPrecheck(
  credential: DemoCredential,
  trustedIssuers: ReadonlySet<string>,
  now: Date = new Date(),
): boolean {
  const expiry = Date.parse(credential.expiresAt);
  return credential.signatureVerifiedByMock
    && trustedIssuers.has(credential.issuer)
    && Number.isFinite(expiry)
    && expiry > now.getTime();
}

const sample: DemoCredential = {
  issuer: "issuer.example.invalid",
  expiresAt: "2099-01-01T00:00:00Z",
  signatureVerifiedByMock: true,
};

console.log(passesDemoPrecheck(sample, new Set(["issuer.example.invalid"])));
