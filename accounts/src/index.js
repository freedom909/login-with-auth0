import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { startStandaloneServer } from '@apollo/server/standalone';
import AccountsDataSource from './graphql/datasources/accounts.js';
import auth0 from './config/auth0.js';
import dotenv from 'dotenv';
import initDataLoaders from './graphql/dataLoaders.js';
import resolvers from './graphql/resolvers.js';
import { authDirectivesTypeDefs, applyAuthDirectives } from './authDirectives.js';

dotenv.config();

const minimalTypeDefs = gql`
  """
  An account is a unique user.
  """
  type Account {
    "The unique ID associated with the account."
    id: ID!
    "The email associated with the account (must be unique)."
    email: String!
    "The date and time the account was created."
    createdAt: String!
  }

  # INPUTS

  """
  Provides data to create a new account.
  """
  input CreateAccountInput {
    "The new account's email (must be unique)."
    email: String!
    "The new account's password."
    password: String!
  }

  """
  Provides data to update an existing account's email.
  """
  input UpdateAccountEmailInput {
    "The unique ID associated with the account."
    id: ID!
    "The updated account email."
    email: String!
  }

  """
  Provides data to update an existing account's password. A current password and new password are required to update a password.
  """
  input UpdateAccountPasswordInput {
    "The unique ID associated with the account."
    id: ID!
    "The updated account password."
    newPassword: String!
    "The existing account password."
    password: String!
  }

  # ROOT

  type Query {
    "Retrieves a single account by ID."
    account(id: ID!): Account! @private
    "Retrieves a list of accounts."
    accounts: [Account] @private
    "Retrieves the account of the currently logged-in user."
    viewer: Account
  }

  type Mutation {
    "Creates a new account."
    createAccount(input: CreateAccountInput!): Account! @private
    "Deletes an account."
    deleteAccount(id: ID!): Boolean! @private
    "Updates an account's email."
    updateAccountEmail(input: UpdateAccountEmailInput!): Account! @private
      @owner(argumentName: "input.id")
    "Updates an account's password."
    updateAccountPassword(input: UpdateAccountPasswordInput!): Account! @private
      @owner(argumentName: "input.id")
  }
`;



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
