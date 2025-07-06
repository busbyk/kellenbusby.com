import { config, fields, collection } from '@keystatic/core'

export default config({
  storage: {
    kind: 'github',
    repo: 'busbyk/kellenbusby.com',
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'app/content/posts/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'published'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        published: fields.checkbox({ label: 'Published' }),
        description: fields.text({ label: 'Description', multiline: true }),
        tags: fields.array(
          fields.relationship({
            label: 'Tags',
            description: 'Tags related to this post',
            collection: 'tags',
          }),
          {
            label: 'Tags',
            itemLabel: (props) => props.value ?? '',
          }
        ),
        content: fields.markdoc({
          label: 'Content',
          options: {
            image: {
              directory: 'public/blog',
              publicPath: '/blog',
            },
          },
        }),
      },
    }),
    tags: collection({
      label: 'Tags',
      slugField: 'name',
      path: 'app/content/tags/*',
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
      },
    }),
  },
  ui: {
    brand: {
      name: 'KB',
      mark: () => <></>,
    },
  },
})
