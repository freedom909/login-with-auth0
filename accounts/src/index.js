import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import dotenv from 'dotenv';

import { ApolloServer } from "@apollo/server";
import gql from 'graphql-tag';
import { buildSubgraphSchema } from "@apollo/subgraph";
import {
    authDirectives,
    restoreReferenceResolvers
  } from "../../shared/index.js";
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
let subgraphSchema = buildSubgraphSchema({ typeDefs, resolvers });
subgraphSchema = authDirectivesTransformer(subgraphSchema);
restoreReferenceResolvers(subgraphSchema, resolvers);

const server = new ApolloServer({
  schema: subgraphSchema,
  context: ({ req }) => {
    const user = req.headers.user ? JSON.parse(req.headers.user) : null;
    return { user, loaders: initDataLoaders() };
  },
  dataSources: () => {
    return {
      accountsAPI: new AccountsAPI({ auth0 })
    };
  }
});
const { url } = await server.listen({ port });
console.log(`Accounts service ready at ${url}`);