import pkg from 'graphql';
const { GraphqlError } = pkg;
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { DateTimeType } from "../../../shared/index.js";


const resolvers = {
    DateTime: DateTimeType,
    Query: {
        async profile(root, { username }, { dataSources }) {
            const profile = await dataSources.ProfilesAPI.getProfile({
                username
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
    },
        Profile: {
            __resolveReference(reference, { dataSources, user }) {
                if (user?.sub) {
                    return dataSources.profilesAPI.getProfileById(reference.id);
                }
                throw new GraphqlError("Not authorized!", {
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
            },
            network(profile,_,{dataSources}){
                return dataSources.ProfilesAPI.getNetworkProfiles(profile.network)
            },
            networkId(profile){
                return profile._id
            },
            isInNetNetwork(profile,_,{dataSources,user}){
                return dataSources.ProfilesAPI.checkViewerHasInNetWork(user.sub,profile.accountId)
            }
            

        },


        Account: {
            profile(account, _, { dataSources }) {
                return dataSources.ProfilesAPI.getProfile({ accountId: account.id })
            }
        },

        Mutation: {
            createProfile(root, { input }, { dataSources }) {
                return dataSources.ProfilesAPI.createProfile(input);
            },
            updateProfile(root, { input: { accountId, ...rest } }, { dataSources }) {
                return dataSources.ProfilesAPI.updateProfile(accountId, rest);
            },
    
             deleteProfile(_,{ accountId},{dataSources}){
                return dataSources.ProfilesAPI.deleteProfile( accountId);
             },
        addToNetwork(_,{input:{accountId,newworkMemberId}},{dataSources}){
            return dataSources.ProfilesAPI.addToNetwork(accountId,newworkMemberId);
        },
        removeFromNetwork(_,{input:{accountId,newworkMemberId}},{dataSources}){
            return dataSources.ProfilesAPI.removeFromNetwork(accountId,newworkMemberId);
        }
        
    }
};
export default resolvers; 