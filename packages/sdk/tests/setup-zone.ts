import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
const { window } = dom;

Object.defineProperty(globalThis, 'window', { value: window, configurable: true });
Object.defineProperty(globalThis, 'document', { value: window.document, configurable: true });
Object.defineProperty(globalThis, 'HTMLElement', { value: window.HTMLElement, configurable: true });
Object.defineProperty(globalThis, 'Node', { value: window.Node, configurable: true });
