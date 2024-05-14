import { RESTDataSource } from '@apollo/datasource-rest';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import getToken from "../../utils/getToken.js";
import { domainToASCII } from 'url'; // Import domainToASCII from the url module


class AccountsDataSource extends RESTDataSource {
  constructor({ auth0 }) {
    super();
    this.auth0 = auth0;
  }

  initialize(config) {
    this.context = config.context;
  }

  // CREATE

  createAccount(email, password) {
    return this.auth0.createUser({
      connection: "Username-Password-Authentication",
      email,
      password
    });
  }

  // READ

  getAccountById(id) {
    return this.context.loaders.accountLoader.load(id);
  }

  getAccounts() {
    return this.auth0.getUsers();
  }

  // UPDATE

  updateAccountEmail(id, email) {
    return this.auth0.updateUser({ id }, { email });
  }

  async updateAccountPassword(id, newPassword, password) {
    const user = await this.auth0.getUser({ id });

    try {
      await getToken(user.email, password);
    } catch {
      throw new UserInputError("Email or existing password is incorrect.");
    }

    return this.auth0.updateUser({ id }, { password: newPassword });
  }

  // DELETE

  async deleteAccount(id) {
    try {
      await this.auth0.deleteUser({ id });
      return true;
    } catch {
      return false;
    }
  }
}

export default AccountsDataSource
