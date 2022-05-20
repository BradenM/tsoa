export const TSOA_SECURITY = Symbol('@tsoa:security');

export interface SecurityMeta {
  security: string | Record<string, string[]>;
  scopes?: string[];
  target: { name: string; target: any };
}

export function fetchSecurity(target?: any): SecurityMeta[] {
  return Reflect.getMetadata(TSOA_SECURITY, target ?? Reflect) || [];
}

export function defineSecurity(meta: SecurityMeta, target?: any) {
  const securities = fetchSecurity();
  Reflect.defineMetadata(TSOA_SECURITY, [...securities, meta], Reflect);
  if (target) {
    const targetSec = fetchSecurity(target);
    Reflect.defineMetadata(TSOA_SECURITY, [...targetSec, meta], target);
  }
}

/**
 * Can be used to indicate that a method requires no security.
 */
export function NoSecurity(): Function {
  return () => {
    return;
  };
}

/**
 * @param {name} security name from securityDefinitions
 */
export function Security(name: string | { [name: string]: string[] }, scopes?: string[]): ClassDecorator & MethodDecorator {
  return (target: Function) => {
    defineSecurity({ security: name, target: { name: target.name, target }, scopes }, target);
  };
}
