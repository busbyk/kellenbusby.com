import * as migration_20250807_062724_init from './20250807_062724_init'

export const migrations = [
  {
    up: migration_20250807_062724_init.up,
    down: migration_20250807_062724_init.down,
    name: '20250807_062724_init',
  },
]
