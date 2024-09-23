"use client";

import token from "@/app/abi/StakingCoin.json";
import { useState, useEffect } from "react";
import { publicClient, useSignedContract } from "@/app/hooks/useConnector";
import useContract from "@/app/hooks/useContract";
import { parseUnits, formatUnits } from "viem";
import { useRecoilState, useRecoilValue } from "recoil";
import { totalStakedRecoil, userAccountAddress, userClaimRecoil, userRewardRecoil, userTotalStakedRecoil , userAvailablePuggyRecoil} from "../state/Account";

const COIN_DECIMALS = 18;
const COIN_ADDRESS = process.env.NEXT_PUBLIC_ST_TOKEN_ADDRESS;

const writeFn = async ({ functionCall, inputVal }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hash;
      if (inputVal != undefined) {
        hash = await functionCall([parseUnits(inputVal.toString(), COIN_DECIMALS)]);
      } else {
        hash = await functionCall();
      }
      const transaction = await publicClient.waitForTransactionReceipt({
        hash,
      });

      if (transaction.status === "success") {
        resolve({
          res: true,
          hash,
        });
      } else {
        resolve ({
           res: false,
           error:'contract call fail'
        });
      }
    } catch (error) {
      const errorMessage = error.message || error.toString();
      const firstLine = errorMessage.split("\n")[0];
      resolve({
        res: false,
        error: firstLine,
      });
    }
  });
};
export function truncateToFixed1(value) {
  const dotIndex = value.indexOf(".");
  if (dotIndex !== -1) {
    return value.substring(0, dotIndex + 2);
  }
  return value;
}
const readFn = async ({ functionCall, inputVal }) => {
  try {
    let token;
    let res;
    if (inputVal != undefined) res = formatUnits(await functionCall([inputVal]), 18);
    else res = formatUnits(await functionCall(), 18);

    token = Number(truncateToFixed1(String(res)));

    return {
      res: true,
      token,
    };
  } catch (error) {
    const firstLine = error.message || error.toString().split("\n")[0];
    return {
      res: false,
      error: firstLine,
    };
  }
};
const useStContract = () => {
  const userAddress = useRecoilValue(userAccountAddress);
  const [userTotalStaked, setUserTotalStaked] = useRecoilState(userTotalStakedRecoil);
  const [totalState, setTotalState] = useRecoilState(totalStakedRecoil);
  const [userReward, setUserReward] = useRecoilState(userRewardRecoil);
  const [userClaim, setUserClaim] = useRecoilState(userClaimRecoil);
  const [userAvailablePuggy , setUserAvailablePuggy] = useRecoilState(userAvailablePuggyRecoil);

  const [stateUserAddress, setStateUserAddress] = useState(null);

  const {readData} = useContract(userAddress);

  const tokenAddress = COIN_ADDRESS;
  const tokenABI = token.abi;
  const tokenContract = useSignedContract(tokenAddress, tokenABI);

  const staking = async (amount) => {
    const state = await writeFn({ functionCall: tokenContract.write.staking, inputVal: amount });
    if (state.res) {
      await userReadData();
    }
    return state;
  };

  const unstaking = async (amount) => {
    const state = await writeFn({ functionCall: tokenContract.write.unStaking, inputVal: amount });

    if (state.res) {
      await userReadData();
    }
    return state;
  };

  const claim = async (amount) => {
    const state = await writeFn({ functionCall: tokenContract.write.rewardClaim });
    if (state.res) {
      await userReadData();
    }
    return state;
  };

  const getTotalStaking = async () => {
    return await readFn({ functionCall: tokenContract.read.getTotalStaking });
  };

  const getUserStakingAmount = async (address) => {
    return await readFn({ functionCall: tokenContract.read.getUserStakingAmount, inputVal: address });
  };

  const getUserReward = async (address) => {
    return await readFn({ functionCall: tokenContract.read.getUserClaimedReward, inputVal: address });
  };

  const getUserClaim = async (address) => {
    return await readFn({ functionCall: tokenContract.read.getUserReward, inputVal: address });
  };

  

  const publicData = async () => {
    const resGetTotalStaking = await getTotalStaking();
    setTotalState(resGetTotalStaking.token);
    if (resGetTotalStaking) return true;
  };

  const userReadData = async () => {
    const resGetUserStakingAmount = await getUserStakingAmount(userAddress);
    setUserTotalStaked(resGetUserStakingAmount.token);

    const userReward = await getUserReward(userAddress);
    setUserReward(userReward.token);

    const userClaim = await getUserClaim(userAddress);
    setUserClaim(userClaim.token);

    await readData();

    const totalStatekd = await publicData();

    if (resGetUserStakingAmount && userReward && totalStatekd) {
      return true;
    }
  };
  const initUserDataFn = () => {
    setUserTotalStaked(0);
    //setTotalState(0);
    setUserReward(0);
    setUserClaim(0);
  };

  useEffect(() => {
    if (userAddress != null) {
      setStateUserAddress(userAddress);
      userReadData();
    }
    publicData();
  }, [userAddress]);

  return {
    getTotalStaking,
    staking,
    unstaking,
    getUserStakingAmount,
    getUserReward,
    getUserClaim,
    claim,
    userReadData,
    initUserDataFn,
  };
};

export default useStContract;
