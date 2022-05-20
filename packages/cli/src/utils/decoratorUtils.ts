import * as ts from 'typescript';
import { getInitializerValue } from '../metadataGeneration/initializer-value';
import { fetchSecurity } from '@tsoa/runtime';

export function getDecorators(node: ts.Node, isMatching: (identifier: ts.Identifier) => boolean) {
  const decorators = (node.decorators || []) as ts.Decorator[];

  // TODO: take and abstract the basic idea here to apply it to other decos.
  if (ts.isClassDeclaration(node)) {
    // lookup up node inheritance tree prototype names.
    let names: string[] = [node.name!.text];
    if (node?.heritageClauses?.length) {
      const parentNames = node.heritageClauses.map(hcl => hcl.types.map(t => t.expression?.getText())).flat();
      names = Array.from(new Set(names.concat(parentNames)));
    }
    const securities = fetchSecurity();
    const secForNode = securities.find(s => names.includes(s.target.name));
    if (secForNode) {
      decorators.push({
        expression: {
          text: 'Security',
          parent: {
            arguments: [ts.factory.createStringLiteral(secForNode?.security as string)],
          } as Extract<ts.CallExpression, 'arguments'>,
        } as Extract<Extract<ts.Identifier, 'expression'>, 'text' | 'parent'>,
      } as Extract<ts.Decorator, 'expression'>);
    }
  }

  if (!decorators || !decorators.length) {
    return [];
  }

  return decorators
    .map((e: any) => {
      while (e.expression !== undefined) {
        e = e.expression;
      }

      return e as ts.Identifier;
    })
    .filter(isMatching);
}

export function getNodeFirstDecoratorName(node: ts.Node, isMatching: (identifier: ts.Identifier) => boolean) {
  const decorators = getDecorators(node, isMatching);
  if (!decorators || !decorators.length) {
    return;
  }

  return decorators[0].text;
}

export function getNodeFirstDecoratorValue(node: ts.Node, typeChecker: ts.TypeChecker, isMatching: (identifier: ts.Identifier) => boolean) {
  const decorators = getDecorators(node, isMatching);
  if (!decorators || !decorators.length) {
    return;
  }
  const values = getDecoratorValues(decorators[0], typeChecker);
  return values && values[0];
}

export function getDecoratorValues(decorator: ts.Identifier, typeChecker: ts.TypeChecker): any[] {
  const expression = decorator.parent as ts.CallExpression;
  const expArguments = expression.arguments;
  if (!expArguments || !expArguments.length) {
    return [];
  }
  return expArguments.map(a => getInitializerValue(a, typeChecker));
}

export function getSecurites(decorator: ts.Identifier, typeChecker: ts.TypeChecker) {
  const [first, second] = getDecoratorValues(decorator, typeChecker);
  if (isObject(first)) {
    return first;
  }
  return { [first]: second || [] };
}

export function isDecorator(node: ts.Node, isMatching: (identifier: ts.Identifier) => boolean) {
  const decorators = getDecorators(node, isMatching);
  if (!decorators || !decorators.length) {
    return false;
  }
  return true;
}

function isObject(v: any) {
  return typeof v === 'object' && v !== null;
}

export function getPath(decorator: ts.Identifier, typeChecker: ts.TypeChecker): string {
  const [path] = getDecoratorValues(decorator, typeChecker);

  if (path === undefined) {
    return '';
  }

  return path;
}

export function getProduces(node: ts.Node, typeChecker: ts.TypeChecker): string[] {
  const producesDecorators = getDecorators(node, identifier => identifier.text === 'Produces');

  if (!producesDecorators || !producesDecorators.length) {
    return [];
  }

  return producesDecorators.map(decorator => getDecoratorValues(decorator, typeChecker)[0]);
}
