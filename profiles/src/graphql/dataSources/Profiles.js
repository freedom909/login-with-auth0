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
}
export default ProfilesAPI;
