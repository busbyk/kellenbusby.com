import React from 'react'
import Markdoc from '@markdoc/markdoc'
import { createReader } from '@keystatic/core/reader'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import keystaticConfig from '../../keystatic.config'

export async function loader({ params }: LoaderFunctionArgs) {
  const reader = createReader(process.cwd(), keystaticConfig)
  const slug = params.slug
  if (!slug) throw json('Not Found', { status: 404 })
  const post = await reader.collections.posts.read(slug, {
    resolveLinkedFiles: true,
  })
  if (!post) throw json('Not Found', { status: 404 })
  const errors = Markdoc.validate(post.content.node, {})
  if (errors.length) {
    console.error(errors)
    throw new Error('Invalid content')
  }
  const content = Markdoc.transform(post.content.node, {})
  return json({
    post: {
      title: post.title,
      content,
    },
  })
}

export default function Post() {
  const { post } = useLoaderData<typeof loader>()
  return (
    <div className="py-8 flex flex-col items-center">
      <div className="max-w-4xl flex flex-col prose prose-invert prose-li:marker:text-white prose-p:my-2 prose-headings:my-4 prose-li:my-0.5 prose-h1:mb-8 prose-h1:text-4xl md:prose-h1:text-5xl text-theme-white prose-figure:my-2">
        <h1>{post.title}</h1>
        {Markdoc.renderers.react(post.content, React)}
      </div>
    </div>
  )
}
