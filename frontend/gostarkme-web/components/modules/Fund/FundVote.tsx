import { calculatePorcentage } from "@/app/utils";
import { Button } from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { fundAbi } from "@/contracts/abis/fund";
import { walletStarknetkitLatestAtom } from "@/state/connectedWallet";
import { latestTxAtom } from "@/state/latestTx";
import { useAtomValue, useSetAtom } from "jotai";
import { Contract, InvokeFunctionResponse } from "starknet";
import { useRouter } from "next/navigation";

interface FundVoteProps {
  upVotes: number,
  upVotesNeeded: number,
  addr: string,
  setLoading: (load: boolean) => void,
  getDetails: () => void,
}

export const FundVote = ({ upVotes, upVotesNeeded, addr, setLoading, getDetails }: FundVoteProps) => {

  const wallet = useAtomValue(walletStarknetkitLatestAtom);

  const progress = calculatePorcentage(upVotes, upVotesNeeded);

  const setLatestTx = useSetAtom(latestTxAtom);

  const router = useRouter();

  async function vote() {
    setLoading(true);
    const fundContract = new Contract(fundAbi, addr, wallet?.account);
    fundContract.receiveVote()
      .then(async (resp: InvokeFunctionResponse) => {
        setLatestTx({ txHash: resp.transaction_hash, type: "vote" });
        router.push("/app/confirmation");
      })
      .catch((e: any) => { getDetails() });
  }

  return (
    <div className="flex flex-col">
      <ProgressBar progress={progress} />
      <div className="flex justify-center my-2">
        <p className="text-center mx-2">{upVotes.toString()} / {upVotesNeeded.toString()} </p>
        <p>&#127775;</p>
      </div>
      {wallet ? ( // Check if a wallet is connected by evaluating 'wallet' condition
        <Button label="Vote" onClick={vote} /> // If the wallet is connected, render a button that allows voting
      ) : ( // If the wallet is not connected, render a disabled vote button with instructions
        <div className="text-center"> 
          <Button 
            label="Vote" 
            onClick={() => {}} 
            className="opacity-50 cursor-not-allowed"
            disabled={true}
          />
          <p className="text-sm text-gray-500 mt-2">
          Connect your wallet to vote
          </p>
        </div>
      )}
    </div>
  );
};
