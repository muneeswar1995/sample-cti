import Clipboard from '@react-native-clipboard/clipboard';
import { useCallback } from "react";

/**
 * @method debounce
 * Creates a debounced version of the provided callback function.
 * The debounced function delays invoking the callback until after the specified delay
 * has elapsed since the last time the debounced function was called.
 *
 * @typeParam T - The type of the callback function.
 * @param callbackFun - The function to debounce.
 * @param timeDelay - The number of milliseconds to delay; defaults to 2000ms.
 * @example
 * const debouncedFunction = debounce(() => console.log("Debounced!"), 1000);
 * debouncedFunction(); // Will log "Debounced!" after 1000ms if not called again.
 * @returns A debounced version of the callback function.
 */
export function debounce<T extends (..._args: never[]) => void>(callbackFun: T, timeDelay = 2000) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callbackFun(...args);
    }, timeDelay);
  };
}

/**
 * @method throttle
 * @description
 * Creates a throttled version of the provided function.
 * The throttled function ensures that the callback is invoked at most once
 * in every specified time window, even if it's called multiple times.
 *
 * @template  - A function type with any number of arguments and no return value.
 * @param  /callbackFun - The function to throttle.
 * @param /[limit=2000] - The time window in milliseconds during which the function can only be called once.
 * @example
 *  const logScroll = () => console.log('Scrolled!');
 *  const throttledScroll = throttle(logScroll, 1000);
 *
 *  window.addEventListener('scroll', throttledScroll);
 * @returns A throttled version of the original function.
 */
export function throttle<T extends (..._args: never[]) => void>(callbackFun: T, limit = 2000) {
  let lastCall = 0;
  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      callbackFun(...args);
    }
  };
}

/**

 * @method once
 * @description
 * Creates a function that invokes the provided function only once.
 * Subsequent calls return the result of the first call.
 *
 * @template T - A function type.
 * @param {T} fn - The function to call only once.
 * @example
 *	const init = once(() => {
 *		console.log("Initializing...");
 *		return "Ready";
 *	});

 *	console.log(init()); // Logs: Initializing... → "Ready"
 *	console.log(init()); // Does NOT log again → "Ready"

 * @returns {T} A new function that only invokes the original function once.
 */
export function once<T extends (..._args: never[]) => unknown>(fn: T): T {
  let called = false;
  let result: ReturnType<T>;
  return function (...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      called = true;
      result = fn(...args) as ReturnType<T>;
    }
    return result;
  } as T;
}

/**
 * @method memoize
 * @description
 * Memoizes the result of a function based on its arguments.
 * Repeated calls with the same arguments return cached result.
 *
 * @template T - A function type.
 * @param {T} fn - The function to memoize.
 * @returns {T} A memoized version of the original function.
 * @example
 *	const slowSquare = (n: number) => {
 *		console.log('Calculating...');
 *		return n * n;
 *	};
 *
 *	const memoizedSquare = memoize(slowSquare);
 *
 *	console.log(memoizedSquare(4)); // Logs: Calculating... → 16
 *	console.log(memoizedSquare(4)); // Uses cache → 16 (no log)
 */
export function memorize<T extends (..._args: never[]) => unknown>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result as ReturnType<T>);
    return result as ReturnType<T>;
  } as T;
}

/**
 * @method delay
 * @description
 * Delays the execution of a function by a given number of milliseconds.
 *
 * @param {() => void} fn - The function to delay.
 * @param {number} ms - Delay in milliseconds.
 */
export function delay(fn: () => void, ms: number): void {
  setTimeout(fn, ms);
}

/**
 * @method compose
 * @description
 * Composes multiple functions from right to left.
 * compose(f, g, h)(x) is equivalent to f(g(h(x))).
 *
 * @param {...Function[]} fns - Functions to compose.
 * @example
 * const double = (x: number) => x * 2;
 * const square = (x: number) => x * x;
 * const doubleThenSquare = compose(square, double);
 * doubleThenSquare(3); // => 36 (square(double(3)) => square(6) => 36)

 * @returns {Function} A new function representing the composition.
 */
export function compose<T>(...fns: Array<(_arg: T) => T>): (_initialValue: T) => T {
  return function (initialValue: T): T {
    return fns.reduceRight((acc, fn) => fn(acc), initialValue);
  };
}

export function useClipboard() {
  const copy = useCallback(async (text: string) => {
    try {
      Clipboard.setString(text);
      return true;
    } catch {
      return false;
    }
  }, []);
  return { copy };
}
