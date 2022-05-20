/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { decorator } from '../utils/reflection';

type Middleware<T extends Function | Object> = T;

const TSOA_MIDDLEWARES = Symbol('@tsoa:middlewares');

/**
 * Install middlewares to the Controller or a specific method.
 * @param middlewares
 * @returns
 */
export function Middlewares<T>(...mws: Array<Middleware<T>>): ClassDecorator & MethodDecorator {
  return decorator(target => {
    if (mws) {
      const current = fetchMiddlewares<T>(target);
      Reflect.defineMetadata(TSOA_MIDDLEWARES, [...current, ...mws], target);
    }
  });
}

/**
 * Internal function used to retrieve installed middlewares
 * in controller and methods (used during routes generation)
 * @param target
 * @returns list of middlewares
 */
export function fetchMiddlewares<T>(target: any): Array<Middleware<T>> {
  return Reflect.getMetadata(TSOA_MIDDLEWARES, target) || [];
}
