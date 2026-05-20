# Compatibility

## Angular version support

| SDK version | Angular | RxJS   | TypeScript | Node (CI) |
|-------------|---------|--------|------------|-----------|
| 0.1.x       | ^20.0.0 | ^7.8.0 | ~5.8.0     | 24        |

> Angular 20 requires Node 20+. The CI pipeline uses Node 24.

## Peer dependency requirements

```json
{
  "@angular/common": "^20.0.0",
  "@angular/core": "^20.0.0",
  "rxjs": "^7.8.0"
}
```

`tslib` is a direct dependency (not a peer) — bundled with the compiled output.

## Browser support

Follows [Angular's browser support policy](https://angular.dev/reference/releases#browser-support) for the targeted Angular major.

## Server-side rendering (SSR)

SSR compatibility is **not tested or guaranteed** in 0.1.x. Services and components may reference browser-only APIs. SSR support is planned post-1.0.

## Module formats

The built package (via ng-packagr) emits:
- ESM (FESM2022) — primary format for modern Angular builds
- UMD — not emitted by default; not required for Angular CLI consumers

## Standalone components

All components are standalone (`standalone: true`) and do not require NgModule imports. Compatible with Angular standalone API introduced in Angular 14+.

## Compatibility with older Angular versions

| Angular version | Status             |
|-----------------|--------------------|
| 20.x            | Supported (0.1.x)  |
| 19.x and below  | Not supported      |

To support older Angular versions, the peer dependency range would need to be widened and tested. Contributions welcome — see [CONTRIBUTING.md](../CONTRIBUTING.md).
