import { GraphQLError } from "graphql";
import { DateTimeType } from "../../../shared/index.js";

const resolvers={
DateTime: DateTimeType,

Account: {
    __resolveReference(_,{dataSource,user}){
      if (user?.sub) {
        return dataSource.accountsAPI.getAccountById(_.id)
    }
    throw new GraphQLError("not authorized",{
        extensions:{
            code:"UNAUTHORIZED"
        }
    })
},
id(account){
    return account.id
},
createdAt(account){
    return account.created_at
},

},

 Query:{
  getAccount:(_,{id},{dataSource})=>{
   return dataSource.accountsAPI.getAccountById(id)
  },
  getAccounts:(_,__,{dataSource})=>{
   return dataSource.accountsAPI.getAccounts()
  },
  viewer:(_,__,{dataSource,user}) => {
    if (user?.sub) {
        return dataSource.accountsAPI.getAccountById(user.sub)
    }
    return null
  }

 },
 Mutation:{
    createAccount:(_,{createAccountInput},{dataSource}) => {
        const {email,password}=createAccountInput
      return dataSource.accountsAPI.createAccount({email,password})
    },
    updateAccount:(_,{input:updateAccountEmailInput},{dataSource}) => {
        const {id,email}=updateAccountEmailInput
        return dataSource.accountsAPI.updateAccountEmail({id,email})
    },
    deleteAccount:(_,{id},{dataSource})=>{
        return dataSource.accountsAPI.deleteAccount(id)
    },
    updateAccountPassword:(_,{input:updateAccountPassword},{dataSource}) =>{
        const {id,password,newPassword}=updateAccountPassword
        return dataSource.accountsAPI.updateAccountPassword(id,password,newPassword)
    } 
 },
}
export default resolvers