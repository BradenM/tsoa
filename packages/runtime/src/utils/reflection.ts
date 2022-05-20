/**
 * Helper function to create a decorator
 * that can act as a class and method decorator.
 * @param fn a callback function that accepts
 *           the subject of the decorator
 *           either the constructor or the
 *           method
 * @returns
 */
export function decorator(fn: (value: any) => void) {
  return (...args: any[]) => {
    // class decorator
    if (args.length === 1) {
      fn(args[0]);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    } else if (args.length === 3 && args[2].value) {
      // method decorator
      const descriptor = args[2] as PropertyDescriptor;
      if (descriptor.value) {
        fn(descriptor.value);
      }
    }
  };
}
