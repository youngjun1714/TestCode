"use client";

import { createPublicClient, fallback, http, getContract } from "viem";
import { useWalletClient } from "wagmi";
import { polygon, polygonAmoy } from "viem/chains";

const chain = process.env.NEXT_PUBLIC_AMOY_CHAIN === "true" ? polygonAmoy : polygon;
const rpcApi = process.env.NEXT_PUBLIC_AMOY_CHAIN === "true" ? process.env.NEXT_PUBLIC_AMOY_RPC : process.env.NEXT_PUBLIC_POLYGON_RPC;

export const useSignedContract = (address, abi) => {
  const { data: walletClient } = useWalletClient();

  const contract = getContract({
    address,
    abi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });

  return contract ? contract : null;
};

const getAlchemyHttp = () => {
  

//  return http(`https://polygon-amoy.g.alchemy.com/v2/${apiKey}`);
  
  return http(rpcApi);
};

export const publicClient = createPublicClient({
  chain,
  transport: fallback([getAlchemyHttp()]),
});
