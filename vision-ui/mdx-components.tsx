import { createFileSystemGeneratorCache, createGenerator } from 'fumadocs-typescript'
import { AutoTypeTable } from 'fumadocs-typescript/ui'
import * as TabsComponents from 'fumadocs-ui/components/tabs'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { ComponentWrapper } from './components/component-wrapper'

const generator = createGenerator({
  // set a cache, necessary for serverless platform like Vercel
  cache: createFileSystemGeneratorCache('.next/fumadocs-typescript'),
})

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    AutoTypeTable: (props) => <AutoTypeTable {...props} generator={generator} />,
    ...TabsComponents,
    ComponentWrapper,
    ...components,
  }
}
