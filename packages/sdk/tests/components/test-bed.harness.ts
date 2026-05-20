import '../setup-zone';
import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

let initialized = false;

export async function initComponentTesting(): Promise<void> {
  if (!initialized) {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    initialized = true;
  }
  TestBed.resetTestingModule();
}

export async function createComponent<T>(
  component: Type<T>,
): Promise<ComponentFixture<T>> {
  await initComponentTesting();
  await TestBed.configureTestingModule({ imports: [component] }).compileComponents();
  return TestBed.createComponent(component);
}
