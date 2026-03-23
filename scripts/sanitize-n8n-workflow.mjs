import fs from 'node:fs';
import path from 'node:path';

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/sanitize-n8n-workflow.mjs <input> <output>');
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const redactCredential = (credentialName) => ({
  id: '__REDACTED__',
  name: `${credentialName} (redacted)`,
});

const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;

  return value
    .replace(/TH[A-Za-z0-9]+/g, '__REDACTED_ACCESS_TOKEN__')
    .replace(/https:\/\/docs\.google\.com\/spreadsheets\/d\/[^\s'"`]+/g, 'https://docs.google.com/spreadsheets/d/__REDACTED__/edit')
    .replace(/\b\d{10,}\b/g, '__REDACTED_ID__')
    .replace(/takalovideo/gi, 'example-account');
};

const sanitizeValue = (value, key = '') => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (typeof value === 'string') {
    let next = sanitizeString(value);

    if (key === 'url' && value.includes('graph.threads.net')) {
      next = next
        .replace(/\/v[\d.]+\/__REDACTED_ID__\//, '/v1.0/__REDACTED_USER_ID__/')
        .replace(/\/v[\d.]+\/\d+\//, '/v1.0/__REDACTED_USER_ID__/');
    }

    return next;
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const output = {};

  for (const [childKey, raw] of Object.entries(value)) {
    let next = sanitizeValue(raw, childKey);

    if (childKey === 'instanceId') {
      next = '__REDACTED_INSTANCE_ID__';
    }

    if (childKey === 'webhookId') {
      next = '__REDACTED_WEBHOOK_ID__';
    }

    if (childKey === 'documentId' && raw && typeof raw === 'object') {
      next = {
        ...next,
        value: '__REDACTED_DOCUMENT_ID__',
        cachedResultName: 'Redacted Google Sheet',
        cachedResultUrl: 'https://docs.google.com/spreadsheets/d/__REDACTED__/edit',
      };
    }

    if (childKey === 'sheetName' && raw && typeof raw === 'object') {
      next = {
        ...next,
        value: '__REDACTED_SHEET_REF__',
        cachedResultName: 'Redacted Sheet',
        cachedResultUrl: 'https://docs.google.com/spreadsheets/d/__REDACTED__/edit#gid=__REDACTED__',
      };
    }

    if (childKey === 'credentials' && raw && typeof raw === 'object') {
      next = Object.fromEntries(
        Object.keys(raw).map((credentialKey) => [
          credentialKey,
          redactCredential(credentialKey),
        ]),
      );
    }

    if (childKey === 'cachedResultUrl' && typeof raw === 'string' && raw.includes('docs.google.com')) {
      next = 'https://docs.google.com/spreadsheets/d/__REDACTED__/edit';
    }

    if (childKey === 'cachedResultName' && typeof raw === 'string') {
      next = 'Redacted Resource';
    }

    output[childKey] = next;
  }

  return output;
};

const sanitized = sanitizeValue(source);
sanitized.name = 'Threads Insights Workflow (Sanitized)';

if (sanitized.meta && typeof sanitized.meta === 'object') {
  sanitized.meta.instanceId = '__REDACTED_INSTANCE_ID__';
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(sanitized, null, 2)}\n`);
