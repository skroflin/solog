// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SologIDL from '../target/idl/solog.json'
import type { Solog } from '../target/types/solog'

// Re-export the generated IDL and type
export { Solog, SologIDL }

// The programId is imported from the program IDL.
export const SOLOG_PROGRAM_ID = new PublicKey(SologIDL.address)

// This is a helper function to get the Solog Anchor program.
export function getSologProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...SologIDL, address: address ? address.toBase58() : SologIDL.address } as Solog, provider)
}

// This is a helper function to get the program ID for the Solog program depending on the cluster.
export function getSologProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Solog program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return SOLOG_PROGRAM_ID
  }
}
