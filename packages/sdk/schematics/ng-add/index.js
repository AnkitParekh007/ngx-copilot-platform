'use strict';

/**
 * ng-add schematic for @ankit-parekh-007/ngx-copilot-sdk
 *
 * Wires `provideCopilot()` into the host Angular app's app.config.ts.
 * Falls back to printing manual instructions when the file cannot be safely patched.
 */

const { chain, noop } = require('@angular-devkit/schematics');

const PACKAGE_NAME = '@ankit-parekh-007/ngx-copilot-sdk';

/** Inserts a string after the first occurrence of a search string. */
function insertAfter(source, search, insertion) {
  const idx = source.indexOf(search);
  if (idx === -1) return null;
  const pos = idx + search.length;
  return source.slice(0, pos) + insertion + source.slice(pos);
}

/** Returns true if the source already imports from the SDK. */
function alreadyImported(source) {
  return source.includes(`'${PACKAGE_NAME}'`) || source.includes(`"${PACKAGE_NAME}"`);
}

/**
 * Rule: patch app.config.ts to add provideCopilot().
 */
function patchAppConfig(options) {
  return (tree, context) => {
    const mode = options.mode || 'ask';

    // Locate app.config.ts — try common paths
    const candidates = [
      'src/app/app.config.ts',
      'projects/' + (options.project || '') + '/src/app/app.config.ts',
    ].filter(Boolean);

    let configPath = null;
    for (const candidate of candidates) {
      if (tree.exists(candidate)) {
        configPath = candidate;
        break;
      }
    }

    if (!configPath) {
      context.logger.warn(
        `[${PACKAGE_NAME}] Could not find app.config.ts. ` +
        `Add provideCopilot() manually:\n\n` +
        `  // app.config.ts\n` +
        `  import { provideCopilot } from '${PACKAGE_NAME}';\n\n` +
        `  export const appConfig: ApplicationConfig = {\n` +
        `    providers: [\n` +
        `      provideCopilot({ defaultMode: '${mode}' }),\n` +
        `    ],\n` +
        `  };\n`,
      );
      return;
    }

    const buffer = tree.read(configPath);
    if (!buffer) {
      context.logger.warn(`[${PACKAGE_NAME}] Could not read ${configPath}. Skipping auto-patch.`);
      return;
    }

    let source = buffer.toString('utf-8');

    if (alreadyImported(source)) {
      context.logger.info(`[${PACKAGE_NAME}] ${configPath} already imports from the SDK. Skipping.`);
      return;
    }

    // 1. Add the import statement after the last existing import block.
    //    We look for the last `import` line and append after the semicolon.
    const importStatement = `import { provideCopilot } from '${PACKAGE_NAME}';\n`;

    // Find the last import line end position
    const importRegex = /^import\s[^;]+;/gm;
    let lastMatch = null;
    let match;
    while ((match = importRegex.exec(source)) !== null) {
      lastMatch = match;
    }

    if (lastMatch) {
      const pos = lastMatch.index + lastMatch[0].length;
      source = source.slice(0, pos) + '\n' + importStatement + source.slice(pos);
    } else {
      // No existing imports — prepend
      source = importStatement + '\n' + source;
    }

    // 2. Insert provideCopilot() into the providers array.
    //    We look for `providers: [` and insert after it.
    const providersSearch = 'providers: [';
    const copilotProvider = `\n    provideCopilot({ defaultMode: '${mode}' }),`;

    const patched = insertAfter(source, providersSearch, copilotProvider);
    if (patched) {
      source = patched;
      context.logger.info(`[${PACKAGE_NAME}] Added provideCopilot() to ${configPath}.`);
    } else {
      context.logger.warn(
        `[${PACKAGE_NAME}] Could not find "providers: [" in ${configPath}. ` +
        `Add provideCopilot({ defaultMode: '${mode}' }) to your providers array manually.`,
      );
    }

    tree.overwrite(configPath, source);
  };
}

/**
 * Rule: print next-step instructions to the console.
 */
function printNextSteps(options) {
  return (_, context) => {
    const mode = options.mode || 'ask';
    context.logger.info('');
    context.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    context.logger.info(`  ${PACKAGE_NAME} installed`);
    context.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    context.logger.info('');
    context.logger.info('  Next steps:');
    context.logger.info('');
    context.logger.info('  1. Add the copilot shell to any component template:');
    context.logger.info('');
    context.logger.info('       <ngx-copilot-shell [context]="{ route: currentRoute }" />');
    context.logger.info('');
    context.logger.info('  2. (Optional) Wire a real backend adapter in app.config.ts:');
    context.logger.info('');
    context.logger.info(`       import { provideHttpAdapter } from '${PACKAGE_NAME}';`);
    context.logger.info('       provideHttpAdapter({ apiBaseUrl: environment.apiUrl })');
    context.logger.info('');
    context.logger.info('  3. (Optional) Provide a Markdown renderer:');
    context.logger.info('');
    context.logger.info(`       import { COPILOT_MARKDOWN_RENDERER } from '${PACKAGE_NAME}';`);
    context.logger.info('       import { marked } from \'marked\';');
    context.logger.info('       { provide: COPILOT_MARKDOWN_RENDERER, useValue: marked.parse }');
    context.logger.info('');
    context.logger.info('  Docs: https://github.com/AnkitParekh007/ngx-copilot-platform');
    context.logger.info('');
  };
}

/**
 * Entry point — exported as `ngAdd`.
 */
function ngAdd(options) {
  return chain([
    patchAppConfig(options),
    printNextSteps(options),
  ]);
}

module.exports = { ngAdd };
