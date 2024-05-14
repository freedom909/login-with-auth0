import util from "util";
import axios from "axios";
import { GraphQLError } from 'graphql';



async function getToken(username, password) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form:{
      audience: process.env.AUTH0_AUDIENCE,
      client_id: process.env.AUTH0_CLIENT_ID_GRAPHQL,
      client_secret: process.env.AUTH0_CLIENT_SECRET_GRAPHQL,
      grant_type: "http://auth0.com/oauth/grant-type/password-realm",
      password,
      realm: "Username-Password-Authentication",
      scope: "openid",
      username
    }
  };

  const response = await requestPromise(options).catch(error => {
    throw new Error("Error getting token");
  });

  const body = response.data;
  const { access_token } = body;

  if (!access_token) {
    throw new Error(body.error_description || "Cannot retrieve access token.");
  }

  return access_token;
}

export default getToken;
