// Load .env
import 'https://deno.land/x/dotenv@v3.1.0/load.ts'
import { default as appExpress } from 'https://raw.githubusercontent.com/hyper63/hyper/hyper-app-express%40v1.0.2/packages/app-express/mod.ts'
import { default as core } from 'https://raw.githubusercontent.com/hyper63/hyper/hyper%40v4.0.1/packages/core/mod.ts'
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'https://cdn.skypack.dev/unique-names-generator'

import { default as myAdapter, PORT } from '../mod.js'

const name = uniqueNamesGenerator({
  separator: '-',
  dictionaries: [adjectives, colors, animals],
})

const hyperConfig = {
  app: appExpress,
  adapters: [
    { port: PORT, plugins: [myAdapter(name)] },
  ],
}

core(hyperConfig)
