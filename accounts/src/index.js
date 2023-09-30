import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { ApolloServerPluginUsageReporting } from '@apollo/server/plugin/usageReporting'; // Removed extra semicolon
import { gql } from 'graphql-tag';
import { buildSubgraphSchema } from "@apollo/subgraph";
import {startStandaloneServer} from '@apollo/server/standalone';
import { authDirectives, restoreReferenceResolvers } from "../../shared/index.js";
import AccountsAPI from "./graphql/datasources/accounts.js";
import auth0 from "./config/auth0.js";
import dotenv from 'dotenv'
dotenv.config()
import initDataLoaders from "./graphql/dataLoaders.js";
import resolvers from "./graphql/resolvers.js";


const __dirname = dirname(fileURLToPath(import.meta.url));

const { authDirectivesTypeDefs, authDirectivesTransformer } = authDirectives();
const subgraphTypeDefs = readFileSync(
  resolve(__dirname, "./graphql/schema.graphql"),
  "utf-8"
);
const typeDefs = gql(`${subgraphTypeDefs}\n${authDirectivesTypeDefs}`);
let subgraphSchema = buildSubgraphSchema({ typeDefs, resolvers });
subgraphSchema = authDirectivesTransformer(subgraphSchema);
restoreReferenceResolvers(subgraphSchema, resolvers);

async function startApolloServer() {
  const port = 4002;
  const subgraphName = 'accounts';
  const server = new ApolloServer({
    schema: subgraphSchema,
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
  try {
    const { url } = await startStandaloneServer(server, {
      context: ({ req }) => {
        const user = req.headers.user ? JSON.parse(req.headers.user) : null;
        return {
          user,
          loaders: initDataLoaders(),
          dataSources: {
            accountsAPI: new AccountsAPI({ auth0 }),
          },
        };
      },
      listen: {
        port,
      },
    });
    console.log(`🚀 Subgraph ${subgraphName} running at ${url}`);
  } catch (err) {
    console.error(err);
  }
}
startApolloServer();


