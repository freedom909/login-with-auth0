import { RESTDataSource } from "@apollo/datasource-rest";
import { ApolloServerErrorCode } from "@apollo/server/errors";

class ProfilesAPI extends RESTDataSource {
  constructor({ Profile }) {
    super();
    this.Profile = Profile;
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
  __formatTages(tags) {
    return tags.map((tag) => tag.replace(/\s+/g, "-").toLowerCase());
  }
  async createProfile(profile) {
    if (profile.interests) {
      const formattedTags = this.__formatTages(profile.interests);
      profile.interests = formattedTags;
    }
    const newProfile = new this.Profile(profile);
    return newProfile.save();
  }
  async updateProfile(accountId, updatedProfileData) {
    if (
      !updatedProfileData ||
      (updatedProfileData && Object.keys(updatedProfileData).length === 0)
    ) {
      throw new ApolloServerErrorCode.BAD_USER_INPUT(
        "you need supply some profile data to update"
      );
    }
    if (updatedProfileData.interests) {
      const formattedTags = this._formatTags(updatedProfileData.interests);
      updatedProfileData.interests = formattedTags;
    }
    return await this.Profile.findOneAndUpdate(
      { accountId: accountId },
      { $set: updatedProfileData },
      {
        new: true,
      }
    );
  }
  async deleteProfile(accountId) {
    try {
      await this.Profile.findOneAndDelete({ accountId: accountId });
      return true;
    } catch {
      return false;
    }
  }
  async addToNetWork(accountId,accountIdToFollow){
if (accountId===accountIdToFollow) {
  throw new ApolloServerErrorCode.BAD_USER_INPUT("User cannot be added to their own network")
}
    const account = await this.Profile.findOneAndUpdate({ accountId: accountId });
    const accountToFollow = await this.Profile.findOneAndUpdate({ accountId: accountIdToFollow });
    if (!account || !accountToFollow) {
      throw new ApolloServerErrorCode.BAD_USER_INPUT(
        "User not found"
      );
    }
    if (account.following.includes(accountToFollow.accountId)) {
      throw new ApolloServerErrorCode.BAD_USER_INPUT(
        "User already added to network"
      );
    }
    const updatedAccount = await this.Profile.findOneAndUpdate
    ({ accountId : accountId},{$push:{ following:[accountToFollow]}}) 
    const updatedAccountToFollow = await this.Profile.findOneAndUpdate
    ({ accountId : accountIdToFollow},{
      $push:{ followers:[account]}
    })
    return { updatedAccount, updatedAccountToFollow };
  }
  async removeFromNetwork(accountId,accountIdToRemove){
if (accountId===accountIdToRemove) {
  throw new ApolloServerErrorCode.BAD_USER_INPUT("User cannot be removed from their own network")
  }
    const account = await this.Profile.findOneAndUpdate({ accountId: accountId });
    const accountToRemove = await this.Profile.findOneAndUpdate({ accountId: accountIdToRemove });
    if (!account || !accountToRemove) {
      throw new ApolloServerErrorCode.BAD_USER_INPUT(
        "User not found"
      );
    }
    if (!account.following.includes(accountToRemove.accountId)) {
      throw new ApolloServerErrorCode.BAD_USER_INPUT(
        "User not in network"
      );
    }
    const updatedAccount = await this.Profile.findOneAndUpdate
    ({ accountId : accountId},{
      $pull:{ following:[accountToRemove.accountId]}
    })
    const updatedAccountToRemove = await this.Profile.findOneAndUpdate
    ({ accountId : accountIdToRemove }, {$pull:{followers:[updatedAccount]}} )
    return { updatedAccount, updatedAccountToRemove };
    }
    async getNetworkProfiles(newwork){
      return this.Profile.find({accountId:{$in:newwork}}).exec()
    }
    async checkViewerHasInNetwork(viewerAccountId,accountId){
      const viewerProfile=await this.Profile.findOne({
        accountId:viewerAccountId 
      }).select("network").exec()
    return viewerProfile.network.includes(accountId)
  }
  }

 

export default ProfilesAPI;
