import type { GameEventByType, GameEventType } from '@/events/events';

type EventListener<T extends GameEventType> = (event: GameEventByType[T]) => void;

class GameEventBus {
  private readonly listeners: Partial<Record<GameEventType, Set<(event: unknown) => void>>> = {};

  on<T extends GameEventType> (type: T, listener: EventListener<T>): () => void {
    const bucket = this.listeners[type] ?? new Set<(event: unknown) => void>();
    bucket.add(listener as (event: unknown) => void);
    this.listeners[type] = bucket;

    return () => { this.off(type, listener); };
  }

  off<T extends GameEventType> (type: T, listener: EventListener<T>): void {
    const bucket = this.listeners[type];
    bucket?.delete(listener as (event: unknown) => void);
  }

  emit<T extends GameEventType> (type: T, event: GameEventByType[T]): void {
    const bucket = this.listeners[type];
    if (bucket === undefined) {
      return;
    }

    for (const listener of bucket) {
      (listener as EventListener<T>)(event);
    }
  }
}

export default GameEventBus;
