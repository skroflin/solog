import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Solog } from '../target/types/solog'

describe('solog', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Solog as Program<Solog>

  const sologKeypair = Keypair.generate()

  it('Initialize Solog', async () => {
    await program.methods
      .initialize()
      .accounts({
        solog: sologKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([sologKeypair])
      .rpc()

    const currentCount = await program.account.solog.fetch(sologKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Solog', async () => {
    await program.methods.increment().accounts({ solog: sologKeypair.publicKey }).rpc()

    const currentCount = await program.account.solog.fetch(sologKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Solog Again', async () => {
    await program.methods.increment().accounts({ solog: sologKeypair.publicKey }).rpc()

    const currentCount = await program.account.solog.fetch(sologKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Solog', async () => {
    await program.methods.decrement().accounts({ solog: sologKeypair.publicKey }).rpc()

    const currentCount = await program.account.solog.fetch(sologKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set solog value', async () => {
    await program.methods.set(42).accounts({ solog: sologKeypair.publicKey }).rpc()

    const currentCount = await program.account.solog.fetch(sologKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the solog account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        solog: sologKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.solog.fetchNullable(sologKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
