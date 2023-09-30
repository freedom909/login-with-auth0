import { dirname, resolve } from "path" ;
import { fileURLToPath } from "url" ;
import { readFileSync } from "fs"; 
import gql from 'graphql-tag';
import {startStandaloneServer} from '@apollo/server/standalone';
import { ApolloServer} from "@apollo/server"; 
import { buildSubgraphSchema } from "@apollo/subgraph" ;
import { authDirectives } from "../../shared/index.js" ;
import initMongoose from "./config/mongoose.js" ;
import Profile from "./models/Profile.js"; 
import ProfilesAPI from "./graphql/dataSources/Profiles.js" ;
import resolvers from "./graphql/resolvers.js" ;
import dotenv from 'dotenv'
dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta. url));
const port = process .env. PORT;
const subgraphName = 'accounts';

const { authDirectivesTypeDefs,  authDirectivesTransformer } =authDirectives()
const subgraphTypeDefs = readFileSync(
    resolve(__dirname, "./graphql/schema.graphql" ),
"utf-8"
);
const typeDefs = gql(` ${subgraphTypeDefs}\n${authDirectivesTypeDefs} `) ;
let subgraphSchema = buildSubgraphSchema({ typeDefs,  resolvers });
subgraphSchema = authDirectivesTransformer(subgraphSchema);

async function startApolloServer() {
    const server = new ApolloServer({
      schema: subgraphSchema
    }); 
    try {
      const { url } = await startStandaloneServer(server, {
        
        context: async ({ req }) => {
            const user = req .headers . user ? JSON. parse(req .headers . user) : null;
  
          return {
            user,
            dataSources:  () => {
                return {
                    profilesApi: new ProfilesAPI({Profile}),
                };
            },
          };
        },
        listen: {
          port,
        },
      });
  
      console.log(`🚀 Subgraph ${subgraphName} running at ${url}`);
    } catch (err) {
      console.error(err);
    }
  }
  startApolloServer()
