import { useMutation } from "@apollo/client";
import Link from "next/link";
import { useState } from "react";
import createFollowTypedDataQuery from "../queries/follow/createFollowTypedDataQuery";
import createUnfollowTypedDataQuery from "../queries/follow/createUnfollowTypedDataQuery";
import { followWithSignature, getEthersProvider } from "../utils/ethers/ethers-service";

export default function Profile(props) {
  const profile = props.profile;
  const displayFullProfile = props.displayFullProfile;

  const [isFollowedByMe, setIsFollowedByMe] = useState(profile.isFollowedByMe);

  const [
    followMutation, 
    { data: followData, loading: followLoading, error: followError }
  ] = useMutation(createFollowTypedDataQuery)

  const [
    unfollowMutation,
    { data: unfollowData, loading: unfollowLoading, error: unfollowError }
  ] = useMutation(createUnfollowTypedDataQuery)

  const handleFollow = async (profile) => {
    const result = isFollowedByMe ?
    await unfollowMutation({
        variables: {
            request: {
                unfollow: {
                    profile: profile.id 
                }
            }
        }
    }) : 
    await followMutation({
        variables: {
            request: {
                follow: {
                    profile: profile.id
                }
            }
        }
    });
    const typedDataKey = isFollowedByMe ? "createUnfollowTypedData" : "createFollowTypedData";
    const typedData = result.data[typedDataKey].typedData;
    
    await followWithSignature(typedData)
  }
  
  return (
    <div className="p-8">
      <Link href={`/profile/${profile.id}`}>
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
          <div className="md:flex">
            <div className="md:shrink-0">
              {profile.picture ? (
                <img
                  src={
                    profile.picture.original
                      ? profile.picture.original.url
                      : profile.picture.uri
                  }
                  className="h-48 w-full object-cover md:h-full md:w-48"
                />
              ) : (
                <div
                  style={{
                    backgrondColor: "gray",
                  }}
                  className="h-48 w-full object-cover md:h-full md:w-48"
                />
              )}
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                {profile.handle}
                {displayFullProfile &&
                  profile.name &&
                  " (" + profile.name + ")"}
              </div>
              <div className="block mt-1 text-sm leading-tight font-medium text-black hover:underline">
                {profile.bio}
              </div>
              <div className="mt-2 text-sm text-slate-900">{profile.ownedBy}</div>
              <p className="mt-2 text-xs text-slate-500">
                following: {profile.stats.totalFollowing} followers:{" "}
                {profile.stats.totalFollowers}
              </p>
              {displayFullProfile 
              ? <button
                onClick={() => handleFollow(profile)}
                disabled={isFollowedByMe}
                class="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                >
                {isFollowedByMe ? "Followed" : "Follow"}
              </button> : null}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}