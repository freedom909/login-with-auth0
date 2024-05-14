import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import {
    ApolloGateway,
    IntrospectAndCompose,
    RemoteGraphQLDataSource
    } from "@apollo/gateway";
    
function initGateway(httpServer) {
    const gateway = new ApolloGateway({
        supergraphSdl: new IntrospectAndCompose({
        // ...
        }),
        
        buildService({ url }) {
            return new RemoteGraphQLDataSource({
            url,
            willSendRequest({ request, context }) {
            request.http.headers.set(
            "user",
            context.user ? JSON.stringify(context.user) : null
            
        );
    }
    });
    }
    });
    // ...
    }
    
    
    export default initGateway