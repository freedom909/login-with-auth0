import { RESTDataSource  } from "@apollo/datasource-rest" ;
import { ApolloServerErrorCode } from '@apollo/server/errors';

class ProfilesAPI extends RESTDataSource  {
    constructor({Profile}) {
        super() ;
        this.Profile = Profile ;
    }
        getProfile(filter) {
            return this.Profile.findOne(filter).exec();
            }
            getProfiles() {
                return this.Profile.find({}).exec();
                }
                getProfileById(id) {
                    return this.Profile.findById(id).exec();
                    }
        
    
}
   export default ProfilesAPI