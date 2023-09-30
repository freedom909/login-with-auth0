import pkg from 'graphql';
const { GraphqlError } = pkg;
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { DateTimeType } from "../../../shared/index.js";


const resolvers = {
    Query:{
       async profile(root, { username }, { dataSources }) {
           const profile = await dataSources.ProfilesAPI.getProfile({ username
           });
           if (!profile) {
               throw new ApolloServerErrorCode.BAD_USER_INPUT("Profile not available.");
               }
               return profile;
   },
   async profiles(root, args, { dataSources }) {
       const profiles = await dataSources.ProfilesAPI.getProfiles();
       if (!profiles) {
           throw new ApolloServerErrorCode.BAD_USER_INPUT("Profiles not available.");
       }
   },
   Profile:{
    __resolveReference(reference, { dataSources, user }) {
        if (user?.sub) {
        return dataSources.profilesAPI.getProfileById(reference.id);
        }
        throw new GraphqlError("Not authorized!",{
            extensions: {
                code: "UNAUTHORIZED"
        },
        });
        },
        account(profile) {
        return { id: profile.accountId };
        },
        id(profile) {
        return profile._id;
        }
        },
    
   
   Account:{
       profile(account,_,{dataSources}){
           return dataSources.ProfilesAPI.getProfile({accountId:account.id})
       }
   }
   }
};
export default resolvers; 