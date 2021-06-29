// Load .env
import "https://deno.land/x/dotenv@v2.0.0/load.ts";

import {
  adjectives,
  animals,
  appOpine,
  colors,
  core,
  uniqueNamesGenerator,
} from "../deps_dev.js";
import { default as myAdapter, PORT } from "../mod.js";

const name = uniqueNamesGenerator({
  separator: "-",
  dictionaries: [adjectives, colors, animals],
});

const hyperConfig = {
  app: appOpine,
  adapters: [
    { port: PORT, plugins: [myAdapter(name)] },
  ],
};

core(hyperConfig);
