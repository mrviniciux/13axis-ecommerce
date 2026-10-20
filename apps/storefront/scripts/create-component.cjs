const fs = require('node:fs');
const path = require('node:path');

const componentName = process.argv[2];

if (!componentName || process.argv.length !== 3) {
  console.error('Uso: pnpm create:component <NomeDoComponente>');
  process.exit(1);
}

if (!/^[A-Z][A-Za-z0-9]*$/.test(componentName)) {
  console.error(
    'O nome do componente deve estar em PascalCase e conter apenas letras e números.'
  );
  process.exit(1);
}

const componentDirectory = path.join(
  __dirname,
  '..',
  'src',
  'components',
  componentName
);

if (fs.existsSync(componentDirectory)) {
  console.error(
    `O componente "${componentName}" já existe em src/components/${componentName}.`
  );
  process.exit(1);
}

const componentTemplate = `import type { ReactNode } from 'react';

type ${componentName}Props = {
  children?: ReactNode;
};

function ${componentName}({ children }: ${componentName}Props) {
  return <div>{children}</div>;
}

export default ${componentName};
`;

const specTemplate = `import { render, screen } from '@testing-library/react';
import ${componentName} from './${componentName}';

test('renders its children', () => {
  render(<${componentName}>${componentName} content</${componentName}>);

  expect(screen.getByText('${componentName} content')).toBeInTheDocument();
});
`;

const indexTemplate = `export { default } from './${componentName}';
`;

fs.mkdirSync(componentDirectory);
fs.writeFileSync(
  path.join(componentDirectory, `${componentName}.tsx`),
  componentTemplate
);
fs.writeFileSync(
  path.join(componentDirectory, `${componentName}.spec.tsx`),
  specTemplate
);
fs.writeFileSync(path.join(componentDirectory, 'index.ts'), indexTemplate);

console.log(
  `Componente "${componentName}" criado em src/components/${componentName}.`
);
