"use client";

import token from "@/app/abi/PuggyCoin.json";
import { useState, useEffect } from "react";
import { useSignedContract, publicClient } from "@/app/hooks/useConnector";
import { parseUnits, formatUnits } from "viem";
import { userAvailablePuggyRecoil } from "../state/Account";
import { useRecoilState } from "recoil";

const COIN_DECIMALS = 18;
const COIN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;

const useContract = (address) => {
  const [userAvailablePuggy, setUserAvailablePuggy] = useRecoilState(userAvailablePuggyRecoil);

  const tokenAddress = COIN_ADDRESS;
  const tokenABI = token.abi;
  const tokenContract = useSignedContract(tokenAddress, tokenABI);

  const getBalance = async ( ownerAddress) => {
    try {
      let token = parseFloat(formatUnits(await tokenContract.read.balanceOf([address]), 18)).toFixed(1);
      return {
        res: true,
        token,
      };
    } catch (error) {
      const errorMessage = error.message || error.toString();
      const firstLine = errorMessage.split("\n")[0];
      return {
        res: false,
        error: firstLine,
      };
    }
  };

  const allowance = async (spendAddress) => {
    try {
      let token = formatUnits(await tokenContract.read.allowance([address, spendAddress]), 18);

      return {
        res: true,
        token,
      };
    } catch (error) {
      const errorMessage = error.message || error.toString();
      const firstLine = errorMessage.split("\n")[0];

      return {
        res: false,
        error: firstLine,
      };
    }
  };

  const approve = async (spendAddress, amount) => {
    return new Promise(async (resolve, reject) => {
      try {
        const hash = await tokenContract.write.approve([spendAddress, parseUnits(amount.toString(), COIN_DECIMALS)]);
        const transaction = await publicClient.waitForTransactionReceipt({
          hash,
        });

        if (transaction && transaction.status === "success") {
          resolve({
            res: true,
            hash,
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

  const readData = async () => {
    const resUserAvailablePuggy = await getBalance();

    setUserAvailablePuggy(resUserAvailablePuggy.token);
  };

  const initUserDataFn = () => {
    setUserAvailablePuggy(0);
  };

  useEffect(() => {
    if (address) {
      readData();
    }
  }, [address]);

  return {
    getBalance,

    allowance,
    approve,
    initUserDataFn,
    readData,
  };
};

export default useContract;
