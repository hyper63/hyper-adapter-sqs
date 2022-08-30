// Load .env
import "https://deno.land/x/dotenv@v3.1.0/load.ts";
import { default as appOpine } from "https://x.nest.land/hyper-app-opine@2.2.0/mod.js";
import { default as core } from "https://x.nest.land/hyper@3.3.0/mod.js";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "https://cdn.skypack.dev/unique-names-generator";

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
