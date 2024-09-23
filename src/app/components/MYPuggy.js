"use client";

import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { useAccount } from "wagmi";
import useContract from "../hooks/useContract";
import useStContract from "../hooks/useStContrac";
import { totalStakedRecoil, userAvailablePuggyRecoil, userTotalStakedRecoil, userRewardRecoil, userClaimRecoil } from "../state/Account";
import Ttile from "./Ttile";

export default function MYPuggy() {
  const titleArr = ["Total Staked", "Available $PUGGY", "Staking Amount", "Reward Received", "Reward Claimable"];
  const userTotalStaked = useRecoilValue(userTotalStakedRecoil);
  const userAvailablePuggy = useRecoilValue(userAvailablePuggyRecoil);
  const totalStaked = useRecoilValue(totalStakedRecoil);
  const userReward = useRecoilValue(userRewardRecoil);
  const userClaim = useRecoilValue(userClaimRecoil);

  const { initUserDataFn } = useStContract();
  const { initUserDataFn: tokeninitUserDataFn } = useContract();
  const { isConnected } = useAccount();

  const [userData, setUserData] = useState({
    totalStaked: 0,
    userAvailablePuggy: 0,
    userStakingAmount: 0,
    userTotalStaked: 0,
    userReward: 0,
    userClaim: 0,
  });

  useEffect(() => {
    if (totalStaked != null) setUserData((prevState) => ({ ...prevState, totalStaked: String(totalStaked) }));
    if (userAvailablePuggy != null) setUserData((prevState) => ({ ...prevState, userAvailablePuggy: String(userAvailablePuggy) }));
    if (userTotalStaked != null) setUserData((prevState) => ({ ...prevState, userTotalStaked: String(userTotalStaked) }));
    if (userReward != null) setUserData((prevState) => ({ ...prevState, userReward: String(userReward) }));
    if (userClaim != null) setUserData((prevState) => ({ ...prevState, userClaim: String(userClaim) }));
  }, [userAvailablePuggy, userTotalStaked, totalStaked, userReward, userClaim]);

  useEffect(() => {
    if (!isConnected) {
      initUserDataFn();
      tokeninitUserDataFn();
    }
  }, [isConnected]);

  return (
    <div className=" max-w-7xl w-full h-full rounded-2xl flex items-center flex-col  bg-[#F9A03ECC] bg-opacity-80 shadow-xl pb-10 px-10 my-8 ">
      <Ttile str="MY PUGGY" />
      <div className="w-full mt-8">
        <div className="font-pretendard w-full grid grid-cols-5 pb-6 text-xs md:text-sm">
          {titleArr.map((title) => (
            <div className="text-center" key={title}>
              {title}
            </div>
          ))}
        </div>
        <hr className="w-full border-black border-3px " />
        <div className="font-pretendard w-full grid grid-cols-5  py-4 text-xs">
          <div className="text-center">{userData.totalStaked === null ? 0 : userData.totalStaked}</div>
          <div className="text-center">{userData.userAvailablePuggy === null ? 0 : userData.userAvailablePuggy}</div>
          <div className="text-center">{userData.userTotalStaked === null ? 0 : userData.userTotalStaked}</div>
          <div className="text-center">{userData.userReward === null ? 0 : userData.userReward}</div>
          <div className="text-center">{userData.userClaim === null ? 0 : userData.userClaim}</div>
        </div>
        <hr className="w-full border-black border-3px mb-8" />
      </div>
    </div>
  );
}
