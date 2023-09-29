import { RESTDataSource } from '@apollo/datasource-rest';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import getToken from "../../utils/getToken.js";

export default class AccountsAPI extends RESTDataSource { 
   constructor({auth0}) {
        super();
        this.auth0=auth0
    }

    initialize(config){
        this.context=config.context
    }

    async getAccounts() {
        const accounts = await this.auth0.getUsers()
        return accounts;
    }

    async getAccountById(id) {
        const account = await this.context.loaders.acountLoader.load(id)
        return account;
    }

    async createAccount(email,password) {
        const newAccount = await this.auth0.createUser({connection:"User-Password-Authentication",email,password});
        return newAccount;
    }
async updateAccountEmail(id, email) {
        const updatedAccount = await this.auth0.updateUser({id},{email})
        return updatedAccount;
    }
   async updateAccountPassword(id,password,newPassword){
        const user=await this.auth0.getUser({id})
        if(!user){
            throw new ApolloServerErrorCode.BAD_USER_INPUT('User not found')
        }
        const errorCodesToIgnore=["BAD_USER_INPUT","GRAPHQL_VALIDATION_FAILED"]
        const errorCode=error.extensions?error.extensions.code:null;
        if (errorCode&&errorCodesToIgnore.includes(errorCode)) {
            return 
        }
       
            await getToken(user.email,password)
            return this.auth0.updatedAccount({id},{password:newPassword})
        }

    async deleteAccount(id) {
        try {
             await this.auth0.deleteUser(id);
             return true
        } catch (error) {
            return false
        }
    }
}

