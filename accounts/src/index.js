import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { startStandaloneServer } from '@apollo/server/standalone';
import AccountsDataSource from './graphql/datasources/accounts.js';
import auth0 from './config/auth0.js';
import dotenv from 'dotenv';
import initDataLoaders from './graphql/dataLoaders.js';
import resolvers from './graphql/resolvers.js';
import { readFileSync } from 'fs';
import { authDirectivesTypeDefs, applyAuthDirectives } from './authDirectives.js';

dotenv.config();

const minimalTypeDefs = gql(readFileSync('./src/graphql/schema.graphql', { encoding: 'utf8' }));

// Combine minimal type definitions with auth directives
const combinedTypeDefs = gql`
  ${minimalTypeDefs}
  ${authDirectivesTypeDefs}
`;

const subgraphSchema = applyAuthDirectives(buildSubgraphSchema({ typeDefs: combinedTypeDefs, resolvers }));

async function startApolloServer() {
  const port = 4002;
  const subgraphName = 'accounts';
  const server = new ApolloServer({
    schema: subgraphSchema,
    context: ({ req }) => ({
      user: req.headers.user ? JSON.parse(req.headers.user) : null,
      loaders: initDataLoaders(),
      dataSources: {
        accountsDataSource: new AccountsDataSource({ auth0 }),
      },
    }),
  });

  try {
    const { url } = await startStandaloneServer(server, { listen: { port } });
    console.log(`🚀 Subgraph ${subgraphName} running at ${url}`);
  } catch (err) {
    console.error(err);
  }
}

startApolloServer();