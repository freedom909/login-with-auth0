
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { ApolloServerPluginUsageReporting } from '@apollo/server/plugin/usageReporting';; // Updated import
import { gql } from 'graphql-tag'; // Updated import
import { buildSubgraphSchema } from "@apollo/subgraph"; // Updated import

import { authDirectives, restoreReferenceResolvers } from "../../shared/index.js";
import AccountsAPI from "./graphql/datasources/accounts.js";
import auth0 from "./config/auth0.js";
import initDataLoaders from "./graphql/dataLoaders.js";
import resolvers from "./graphql/resolvers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT;

const { authDirectivesTypeDefs, authDirectivesTransformer } = authDirectives();
const subgraphTypeDefs = readFileSync(
  resolve(__dirname, "./graphql/schema.graphql"),
  "utf-8"
);
const typeDefs = gql(`${subgraphTypeDefs}\n${authDirectivesTypeDefs}`);
let subgraphSchema = buildSubgraphSchema({ typeDefs, resolvers }); // Updated function name
subgraphSchema = authDirectivesTransformer(subgraphSchema);
restoreReferenceResolvers(subgraphSchema, resolvers);

const server = new ApolloServer({
  schema: subgraphSchema,
  context: ({ req }) => {
    const user = req.headers.user ? JSON.parse(req.headers.user) : null;
    return { user, loaders: initDataLoaders() };
  },
  plugins: [
    process.env.NODE_ENV === "production"
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground(),
  ],

  dataSources: () => {
    return {
      accountsAPI: new AccountsAPI({ auth0 }),
    };
  },
});

server.listen({ port }).then(({ url }) => {
  console.log(`Accounts service ready at ${url}`);
});


