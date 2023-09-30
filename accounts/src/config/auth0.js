

import { ManagementClient } from "auth0";

const auth0 = new ManagementClient({
  domain:prcess.env.DOMAIN,
  clientId: process.env,CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

export default auth0;


