// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import HTMLInterface from '@/presentation/htmlinterface';

describe('HTMLInterface canvas constraints', () => {
  it('reserves visible toolbar height from the available canvas height', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const page = new HTMLInterface(shadow);

    Object.defineProperty(window, 'innerHeight', { value: 700, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: 900, configurable: true });
    vi.spyOn(page.ui, 'getLayoutHeight').mockReturnValue(64);
    const playfield = (page as unknown as { playfield: HTMLDivElement }).playfield;
    Object.defineProperty(playfield.parentElement as HTMLDivElement, 'clientWidth', { value: 540, configurable: true });
    vi.spyOn(playfield, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 100,
      top: 100,
      right: 540,
      bottom: 460,
      left: 0,
      width: 540,
      height: 360,
      toJSON: () => ({})
    });

    const constraints = page.getCanvasSizeConstraints();

    expect(constraints).toEqual({ width: 540, height: 528 });

    document.body.removeChild(host);
  });
});
