#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpRoot = path.join(root, 'tmp', 'consumer-smoke');
const appDir = path.join(tmpRoot, 'consumer-app');
const distLib = path.join(root, 'dist', 'ngx-copilot-sdk');

function run(command, cwd = root) {
  console.log(`\n> ${command}`);
  execSync(command, { cwd, stdio: 'inherit', shell: true, env: process.env });
}

function write(relPath, contents) {
  const target = path.join(appDir, relPath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, contents, 'utf8');
}

console.log('Consumer smoke test: build library');
run('npm run build');

console.log('Consumer smoke test: pack tarball');
const packOutput = execSync('npm pack --json', { cwd: distLib, encoding: 'utf8' });
const packMeta = JSON.parse(packOutput);
const tarballName = packMeta[0].filename;
const tarballPath = path.join(distLib, tarballName);

if (existsSync(tmpRoot)) {
  rmSync(tmpRoot, { recursive: true, force: true });
}
mkdirSync(appDir, { recursive: true });

write(
  'package.json',
  JSON.stringify(
    {
      name: 'consumer-smoke-app',
      private: true,
      version: '0.0.0',
      scripts: {
        build: 'ng build --configuration=production',
      },
    },
    null,
    2,
  ),
);

write(
  'angular.json',
  JSON.stringify(
    {
      version: 1,
      projects: {
        'consumer-app': {
          projectType: 'application',
          root: '',
          sourceRoot: 'src',
          prefix: 'app',
          architect: {
            build: {
              builder: '@angular-devkit/build-angular:application',
              options: {
                outputPath: 'dist/consumer-app',
                index: 'src/index.html',
                browser: 'src/main.ts',
                tsConfig: 'tsconfig.app.json',
              },
              configurations: {
                production: {
                  outputHashing: 'all',
                },
              },
            },
          },
        },
      },
    },
    null,
    2,
  ),
);

write(
  'tsconfig.json',
  JSON.stringify(
    {
      compileOnSave: false,
      compilerOptions: {
        strict: true,
        target: 'ES2022',
        module: 'ES2022',
        moduleResolution: 'bundler',
        experimentalDecorators: true,
      },
    },
    null,
    2,
  ),
);

write(
  'tsconfig.app.json',
  JSON.stringify(
    {
      extends: './tsconfig.json',
      compilerOptions: {
        outDir: './out-tsc',
      },
      files: ['src/main.ts'],
      include: ['src/**/*.ts'],
    },
    null,
    2,
  ),
);

write(
  'src/index.html',
  '<!doctype html><html><head><meta charset="utf-8"><title>smoke</title><base href="/"></head><body><app-root></app-root></body></html>',
);

write(
  'src/main.ts',
  `import { bootstrapApplication } from '@angular/platform-browser';
import { SmokeComponent } from './smoke.component';
import { appConfig } from './app.config';

bootstrapApplication(SmokeComponent, appConfig).catch(console.error);
`,
);

write(
  'src/app.config.ts',
  `import { ApplicationConfig } from '@angular/core';
import { provideCopilot } from '@ankitparekh007/ngx-copilot-sdk';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCopilot({
      apiBaseUrl: '/api/copilot',
      defaultMode: 'ask',
    }),
  ],
};
`,
);

write(
  'src/smoke.component.ts',
  `import { Component } from '@angular/core';
import {
  CopilotService,
  CopilotShellComponent,
  getApprovalTone,
  normalizeCopilotConfig,
  provideCopilot,
} from '@ankitparekh007/ngx-copilot-sdk';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CopilotShellComponent],
  template: '<ngx-copilot-shell [context]="context" [useService]="true" />',
})
export class SmokeComponent {
  readonly context = { route: '/smoke' };
  readonly _config = normalizeCopilotConfig({ apiBaseUrl: '/api/copilot' });
  readonly _tone = getApprovalTone({
    id: 'a',
    title: 't',
    reason: 'r',
    actionSummary: 's',
    riskLevel: 'low',
  });
  constructor(readonly copilot: CopilotService) {}
  static readonly providers = [provideCopilot({ apiBaseUrl: '/api/copilot' })];
}
`,
);

console.log('Consumer smoke test: install Angular app dependencies');
run(
  `npm install --legacy-peer-deps @angular/cli@20.3.13 @angular-devkit/build-angular@20.3.13 @angular/compiler-cli@20.3.19 typescript@~5.8.0 @angular/core@20.3.19 @angular/common@20.3.19 @angular/compiler@20.3.19 @angular/platform-browser@20.3.19 @angular/platform-browser-dynamic@20.3.19 rxjs@^7.8.0 tslib@^2.6.0 zone.js@^0.15.0 "${tarballPath}"`,
  appDir,
);

console.log('Consumer smoke test: production build');
run('npx ng build consumer-app --configuration=production', appDir);

console.log('\nConsumer smoke test passed.');
