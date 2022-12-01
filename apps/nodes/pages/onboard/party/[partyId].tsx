/* eslint-disable camelcase */
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { UserContext } from "@eden/package-context";
import {
  ENTER_ROOM,
  FIND_ROOM,
  MEMBER_UPDATED,
  ROOM_UPDATED,
  UPDATE_MEMBER,
} from "@eden/package-graphql";
import { Members, SkillType_Member } from "@eden/package-graphql/generated";
import {
  AppPublicLayout,
  Avatar,
  Card,
  EditProfileOnboardPartyNodesCard,
  GridItemNine,
  GridItemThree,
  GridLayout,
  NodesOnboardPartyContainer,
  TextHeading2,
  TextHeading3,
} from "@eden/package-ui";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import type { NextPageWithLayout } from "../../_app";

const OnboardPartyPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { partyId } = router.query;

  const [members, setMembers] = useState<Members[]>([]);
  const [isRoomExist, setIsRoomExist] = useState(true);

  const { currentUser } = useContext(UserContext);

  const { data: dataRoom } = useQuery(FIND_ROOM, {
    variables: {
      fields: {
        _id: partyId,
      },
    },
    skip: !partyId,
    context: { serviceName: "soilservice" },
  });

  const { data: dataRoomSubscription } = useSubscription(ROOM_UPDATED, {
    variables: {
      fields: { _id: partyId },
    },
    skip: !partyId,
    context: { serviceName: "soilservice" },
  });

  const membersIds: Array<string> = dataRoomSubscription
    ? dataRoomSubscription.roomUpdated.members.map(
        (member: Members) => member._id
      )
    : dataRoom?.findRoom?.members.map((member: Members) => member._id);

  useSubscription(MEMBER_UPDATED, {
    variables: {
      fields: { _id: membersIds },
    },
    skip: !membersIds,
    context: { serviceName: "soilservice" },
    onData: ({ data }) => {
      const newMemberData = data?.data?.subscriptionData?.data?.memberUpdated;

      setMembers(
        members.map((member: Members) => {
          if (member._id !== newMemberData?._id) return member;
          return newMemberData;
        })
      );
    },
  });

  const [enterRoom] = useMutation(ENTER_ROOM, {
    onCompleted: () => {
      console.log("enterRoom completed");
    },
    // errorPolicy: "ignore",
    onError: (error) => {
      console.log("error", error);
      if (error) setIsRoomExist(false);
    },
  });

  useEffect(() => {
    // if user logged in and not in party, add currentUser to party
    if (!currentUser || !partyId) return;
    if (
      partyId &&
      !!membersIds?.length &&
      currentUser &&
      membersIds.some((id) => id === currentUser?._id)
    ) {
      return;
    }
    if (!isRoomExist) return;
    enterRoom({
      variables: {
        fields: {
          roomID: partyId,
          memberID: currentUser?._id,
        },
      },
    });
  }, [currentUser, membersIds, partyId]);

  // Custom query with only members basic data and skills
  useQuery(
    gql`
      query ($fields: findMembersInput) {
        findMembers(fields: $fields) {
          _id
          discordAvatar
          discordName
          bio
          skills {
            skillInfo {
              _id
              name
            }
            level
          }
          links {
            name
            url
          }
          memberRole {
            _id
            title
          }
          nodes {
            nodeData {
              _id
              name
              node
            }
          }
        }
      }
    `,
    {
      variables: {
        fields: {
          _id: membersIds,
        },
      },
      skip: !membersIds || members.length === membersIds.length,
      context: { serviceName: "soilservice" },
      onCompleted: (data) => {
        if (data) {
          setMembers(data.findMembers);
        }
      },
    }
  );

  const [updateMember] = useMutation(UPDATE_MEMBER, {});

  const handleUpdateUser = (val: any, name: any) => {
    if (!partyId || !currentUser) return;

    let bio = currentUser?.bio || null;
    let role = currentUser?.memberRole?._id || null;

    if (name === "bio") {
      bio = val;
    }
    if (name === "role") {
      role = val._id;
    }

    updateMember({
      variables: {
        fields: {
          _id: currentUser?._id,
          serverID: currentUser?.serverID,
          skills: currentUser?.skills?.map((skill: SkillType_Member | null) => {
            return {
              id: skill?.skillInfo?._id,
              level: skill?.level,
            };
          }),
          bio: bio,
          memberRole: role,
        },
      },
    });
  };

  return (
    <GridLayout>
      <GridItemThree>
        <div className={`h-85 scrollbar-hide space-y-4 overflow-scroll p-1`}>
          <Card shadow className={` bg-white p-4`}>
            <div className={`flex`}>
              <div className={``}>
                <Avatar
                  isProject
                  size={`sm`}
                  src={`https://pbs.twimg.com/profile_images/1595723986524045312/fqOO4ZI__400x400.jpg`}
                />
              </div>
              <div className={`my-auto ml-4`}>
                <TextHeading2>Eden x Art Basel</TextHeading2>
              </div>
            </div>
            <div className={`mt-2 flex`}>
              <div>📍</div>
              <div
                className={`text-darkGreen font-poppins ml-4 space-y-4 text-sm`}
              >
                <p>
                  IRL: Miami beach boat dock 🛥Virtual Meet-up in Gather Town🚀
                </p>
                <p>
                  Be the first one to hear about Eden Microgrant Incentive
                  Program 🌱 & connect with special guests IRL and on Gather
                  Town!
                </p>
              </div>
            </div>
          </Card>
          {!currentUser ? (
            <p>
              You must be logged in to edit your profile.
              <br />
              If you can&rsquo;t log in ask the onboarder for help
            </p>
          ) : (
            <EditProfileOnboardPartyNodesCard
              handleUpdateUser={handleUpdateUser}
            />
          )}
        </div>
      </GridItemThree>
      <GridItemNine>
        <div className={`h-85 flex flex-col gap-4`}>
          <Card shadow className={`bg-white p-4`}>
            <div className={``}>
              <TextHeading3>Best people for you to meet:</TextHeading3>
              <div className={`text-sm text-zinc-500`}>Powered by Eden AI</div>
              <div className={`mt-2 flex`}>
                <div className={`flex-col content-center text-center`}>
                  <div className={`m-auto`}>
                    <Avatar
                      isProject
                      size={`sm`}
                      src={`https://pbs.twimg.com/profile_images/1595723986524045312/fqOO4ZI__400x400.jpg`}
                    />
                  </div>

                  <div className={`font-medium text-zinc-500`}>@name</div>
                </div>
              </div>
            </div>
          </Card>
          <NodesOnboardPartyContainer members={members} />
        </div>
      </GridItemNine>
    </GridLayout>
  );
};

OnboardPartyPage.getLayout = (page) => (
  <AppPublicLayout>{page}</AppPublicLayout>
);

export default OnboardPartyPage;