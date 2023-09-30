import { DataSource } from "@apollo/datasource-rest" ;
import { UserInputError } from "@apollo/server" ;

class ProfilesAPI extends DataSource {
    constructor({Profile}) {
        super() ;
        this.Profile = Profile ;
    }
}
   export default ProfilesAPI