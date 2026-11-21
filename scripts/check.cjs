'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pngSignature = Buffer.from('89504e470d0a1a0a', 'hex');

function catalogue(code) {
  const source = read(code + '.json');
  const result = JSON.parse(source);
  assert.ok(result && !Array.isArray(result) && typeof result === 'object', code + ' must contain a message dictionary');
  const seen = new Set();
  for (const token of source.matchAll(/"(?:\\.|[^"\\])*"/g)) {
    if (!/^\s*:/.test(source.slice(token.index + token[0].length))) continue;
    const key = JSON.parse(token[0]);
    assert.ok(!seen.has(key), code + ': duplicate key ' + key);
    seen.add(key);
  }
  return result;
}

function placeholders(value) {
  return (value.match(/\{[^{}]+\}|%[sdi]|<\/?[^<>]+>/g) || []).sort();
}

const manifest = JSON.parse(read('_languages.json'));
const codes = manifest.map(entry => entry.code);
assert.ok(codes.includes('en'), 'Missing English source');
assert.equal(new Set(codes).size, codes.length, 'Duplicate game language code');
for (const { code, locale, name, flag, electronLocales } of manifest) {
  assert.match(code, /^[a-z]{2,3}$/);
  assert.ok(typeof name === 'string' && name.trim(), code + ': missing language name');
  assert.match(flag, /^[a-z]{2}\.png$/);
  const flagImage = fs.readFileSync(path.join(root, 'flags', flag));
  assert.ok(flagImage.subarray(0, 8).equals(pngSignature), code + ': invalid flag PNG ' + flag);
  new Intl.Locale(locale || code);
  if (electronLocales !== undefined) {
    assert.ok(Array.isArray(electronLocales) && electronLocales.length, code + ': expected Electron locale names');
    for (const tag of electronLocales) new Intl.Locale(tag);
  }
}
const files = fs.readdirSync(root).filter(name => name.endsWith('.json') && name !== '_languages.json').sort();
assert.deepEqual(files, codes.map(code => code + '.json').sort(), 'Language files must match the manifest');
const english = catalogue('en');
const keys = Object.keys(english);
assert.ok(keys.length > 0, 'English catalogue must contain messages');
const issues = [];
for (const code of codes) {
  const strings = catalogue(code);
  for (const key of new Set([...keys, ...Object.keys(strings)])) {
    const value = strings[key];
    const label = code + '.' + key;
    if (!Object.hasOwn(english, key)) issues.push(label + ' is obsolete');
    else if (typeof value !== 'string' || !value.trim()) issues.push(label + ' is missing or empty');
    else if (JSON.stringify(placeholders(english[key])) !== JSON.stringify(placeholders(value))) issues.push(label + ' has different placeholders');
    else if (/[\uFFFD⟦⟧⟪⟫]/u.test(value)) issues.push(label + ' contains a broken character or translation marker');
  }
}
if (issues.length) throw new Error(issues.join('\n'));
console.log(codes.length + ' languages × ' + keys.length + ' messages checked.');
