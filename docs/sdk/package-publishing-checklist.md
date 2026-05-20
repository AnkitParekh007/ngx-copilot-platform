# Package Publishing Checklist

Do not publish this package until the following are true:

- exported APIs have been reviewed for naming and long-term support
- `public-api.ts` contains only intentional surface area
- README examples compile against the packaged output
- tests cover config, context, adapters, registry behavior, and approval logic
- Angular version compatibility is documented
- semantic versioning policy is defined
- changelog discipline is in place
- a real install verification is run from a clean consumer app

This file is a readiness checklist only. It does not automate publishing.
