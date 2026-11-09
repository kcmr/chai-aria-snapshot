import {
  generateAriaTree,
  matchAriaTree,
  parseAriaTemplate,
  renderAriaTemplate,
} from 'ivya/aria';

export function compileTemplate(expectedYaml: unknown) {
  if (typeof expectedYaml !== 'string' || !expectedYaml.trim()) {
    throw new TypeError('Expected a non-empty ARIA YAML template.');
  }

  const lines = expectedYaml
    .replace(/\r\n?/g, '\n')
    .replace(/^\s*\n/, '')
    .replace(/\n\s*$/, '')
    .split('\n');
  const indent = Math.min(
    ...lines
      .filter((line) => line.trim())
      .map((line) => line.match(/^ */)?.[0].length ?? 0),
  );
  const yaml = lines.map((line) => line.slice(indent)).join('\n');
  const template = parseAriaTemplate(yaml);

  return { template, expected: renderAriaTemplate(template) };
}

function assertElement(element: unknown): asserts element is Element {
  if (
    typeof element !== 'object' ||
    element === null ||
    !('nodeType' in element) ||
    element.nodeType !== 1 ||
    !('isConnected' in element) ||
    element.isConnected !== true
  ) {
    throw new TypeError(
      'ARIA snapshots require an Element connected to the document.',
    );
  }
}

export function matchTemplate(
  element: unknown,
  { template, expected }: ReturnType<typeof compileTemplate>,
) {
  assertElement(element);
  const result = matchAriaTree(generateAriaTree(element), template);

  return { matches: result.pass, actual: result.resolved, expected };
}
