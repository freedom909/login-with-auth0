

import auth0 from "../config/auth0.js";
import getToken from "../utils/getToken.js";
import { GraphQLError } from "graphql";

import { DateTimeType } from "../../../shared/index.js";

const resolvers = {
  DateTime: DateTimeType,

  Account: {
    __resolveReference(_, { dataSources, user }) {
      if (user?.sub) {
        return dataSources.accountsDataSource.getAccountById(_.id);
      }
      throw new ApolloError("Not authorized!");
    },
    id(account) {
      return account.user_id;
    },
    createdAt(account) {
      return account.created_at;
    }
  },

  Query: {
    account(root, { id }, { dataSources }) {
      return dataSources.accountsDataSource.getAccountById(id);
    },
    accounts(root, args, { dataSources }) {
      return dataSources.accountsDataSource.getAccounts();
    },
    viewer(root, args, { dataSources, user }) {
      if (user?.sub) {
        return dataSources.accountsDataSource.getAccountById(user.sub);
      }
      return null;
    }
  },

  Mutation: {
    createAccount(root, { input: { email, password } }, { dataSources }) {
      return dataSources.accountsDataSource.createAccount(email, password);
    },
    deleteAccount(root, { id }, { dataSources }) {
      return dataSources.accountsDataSource.deleteAccount(id);
    },
    updateAccountEmail(root, { input: { id, email } }, { dataSources }) {
      return dataSources.accountsDataSource.updateAccountEmail(id, email);
    },
    updateAccountPassword(
      root,
      { input: { id, newPassword, password } },
      { dataSources }
    ) {
      return dataSources.accountsDataSource.updateAccountPassword(
        id,
        newPassword,
        password
      );
    }
  }
};

export default resolvers;
