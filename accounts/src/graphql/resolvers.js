


import { GraphQLError } from "graphql";
import { DateTimeType } from "../../../shared/index.js";

const resolvers = {
  DateTime: DateTimeType,

  Account: {
    __resolveReference(_, { dataSource, user }) {
      if (user?.sub) {
        return dataSource.accountsAPI.getAccountById(_.id);
      }
      throw new GraphQLError("not authorized", {
        extensions: {
          code: "UNAUTHORIZED",
        },
      });
    },
    id(account) {
      return account.id;
    },
    createdAt(account) {
      return account.createdAt;
    },
  },

  Query: {
    account: (_, { id }, { dataSource }) => {
      return dataSource.accountsAPI.getAccountById(id);
    },
    accounts: (_, __, { dataSource }) => {
      return dataSource.accountsAPI.getAccounts();
    },
    viewer: (_, __, { dataSource, user }) => {
      if (user?.sub) {
        return dataSource.accountsAPI.getAccountById(user.sub);
      }
      return null;
    },
  },

  Mutation: {
    createAccount: (_, { createAccountInput }, { dataSource }) => {
      const { email, password } = createAccountInput;
      return dataSource.accountsAPI.createAccount({ email, password });
    },
    updateAccount: (_, { input: updateAccountEmailInput }, { dataSource }) => {
      const { id, email } = updateAccountEmailInput;
      return dataSource.accountsAPI.updateAccountEmail({ id, email });
    },
    deleteAccount: (_, { id }, { dataSource }) => {
      return dataSource.accountsAPI.deleteAccount(id);
    },

    updateAccountPassword: (
      _,
      { input: UpdateAccountPasswordInput },
      { dataSource }
    ) => {
      const { id, password, newPassword } = UpdateAccountPasswordInput;
      return dataSource.accountsAPI.updateAccountPassword(
        id,
        password,
        newPassword
      );
    },
  },
};

export default resolvers;
