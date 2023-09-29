import DataLoader from "dataloader";
import auth0 from "../config/auth0.js";
import dotenv from 'dotenv';
dotenv.config();

function initDataLoaders(){
    const accouontLoader=new DataLoader(async keys=>{
        const q=keys.map(key=>`user_id:${key}`).join("OR")
        const accounts = await auth0.getUsers({ search_engine: "v4", q });
        return keys.map(key=>accounts.find(account=>account.user_id===key))

    })
    return {accouontLoader};
}

export default initDataLoaders