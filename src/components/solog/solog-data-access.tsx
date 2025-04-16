'use client'
import { getSologProgram, getSologProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useSologProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSologProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getSologProgram(provider, programId), [provider, programId])

  const products = useQuery({
    queryKey: ['solog', 'products', { cluster }],
    queryFn: () => program.account.productState.all(),
  })

  const journalEntries = useQuery({
    queryKey: ['solog', 'journal-entries', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createProduct = useMutation({
    mutationKey: ['solog', 'create-product', { cluster }],
    mutationFn: async ({ productId, name, description, initialNotes }: { 
      productId: string, 
      name: string, 
      description: string, 
      initialNotes: string 
    }) => {
      const [productPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("product"), Buffer.from(productId)],
        programId
      )

      const [journalPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("journal"), productPDA.toBuffer(), Buffer.from([0])],
        programId
      )

      return program.methods
        .createProduct(productId, name, description, initialNotes)
        .accounts({
          product: productPDA,
          journalEntry: journalPDA,
          creator: provider.publicKey,
          systemProgram: PublicKey.programId,
        })
        .rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return Promise.all([products.refetch(), journalEntries.refetch()])
    },
    onError: () => toast.error('Failed to create product'),
  })

  return {
    program,
    programId,
    products,
    journalEntries,
    getProgramAccount,
    createProduct,
  }
}

export function useProductAccount({ productId }: { productId: string }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, products, journalEntries } = useSologProgram()
  const provider = useAnchorProvider()

  const productPDA = useMemo(() => {
    if (!productId) return null
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("product"), Buffer.from(productId)],
      program.programId
    )
    return pda
  }, [productId, program.programId])

  const productQuery = useQuery({
    queryKey: ['solog', 'product', { cluster, productId }],
    queryFn: () => productPDA ? program.account.productState.fetch(productPDA) : null,
    enabled: !!productPDA,
  })

  const productJournalEntries = useQuery({
    queryKey: ['solog', 'product-journal', { cluster, productId }],
    queryFn: async () => {
      if (!productPDA) return []
      const entries = await program.account.journalEntryState.all([
        {
          memcmp: {
            offset: 8,
            bytes: productPDA.toBase58(),
          },
        },
      ])
      return entries.sort((a, b) => a.account.entryNumber - b.account.entryNumber)
    },
    enabled: !!productPDA,
  })

  const addJournalEntry = useMutation({
    mutationKey: ['solog', 'add-journal', { cluster, productId }],
    mutationFn: async ({ title, message, newStatus, newLocation }: {
      title: string,
      message: string,
      newStatus: string,
      newLocation: string,
    }) => {
      if (!productPDA || !productQuery.data) throw new Error("Product not found")
      
      const [journalPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from("journal"),
          productPDA.toBuffer(),
          Buffer.from([productQuery.data.journalEntriesCount])
        ],
        program.programId
      )

      return program.methods
        .addJournalEntry(title, message, newStatus, newLocation)
        .accounts({
          product: productPDA,
          journalEntry: journalPDA,
          handler: provider.publicKey,
          systemProgram: PublicKey.programId,
        })
        .rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return Promise.all([productQuery.refetch(), productJournalEntries.refetch(), journalEntries.refetch()])
    },
    onError: (error) => toast.error(`Failed to add journal entry: ${error.toString()}`),
  })

  const transferProduct = useMutation({
    mutationKey: ['solog', 'transfer', { cluster, productId }],
    mutationFn: async ({ title, message, newLocation, newOwner }: {
      title: string,
      message: string,
      newLocation: string,
      newOwner: PublicKey,
    }) => {
      if (!productPDA || !productQuery.data) throw new Error("Product not found")
      
      const [journalPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from("journal"),
          productPDA.toBuffer(),
          Buffer.from([productQuery.data.journalEntriesCount])
        ],
        program.programId
      )

      return program.methods
        .transferProduct(title, message, newLocation)
        .accounts({
          product: productPDA,
          journalEntry: journalPDA,
          currentOwner: provider.publicKey,
          newOwner: newOwner,
          systemProgram: PublicKey.programId,
        })
        .rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return Promise.all([productQuery.refetch(), productJournalEntries.refetch(), journalEntries.refetch()])
    },
    onError: (error) => toast.error(`Failed to transfer product: ${error.toString()}`),
  })

  const markDelivered = useMutation({
    mutationKey: ['solog', 'deliver', { cluster, productId }],
    mutationFn: async ({ title, message }: {
      title: string,
      message: string,
    }) => {
      if (!productPDA || !productQuery.data) throw new Error("Product not found")
      
      const [journalPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from("journal"),
          productPDA.toBuffer(),
          Buffer.from([productQuery.data.journalEntriesCount])
        ],
        program.programId
      )

      return program.methods
        .markDelivered(title, message)
        .accounts({
          product: productPDA,
          journalEntry: journalPDA,
          handler: provider.publicKey,
          systemProgram: PublicKey.programId,
        })
        .rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return Promise.all([productQuery.refetch(), productJournalEntries.refetch(), journalEntries.refetch()])
    },
    onError: (error) => toast.error(`Failed to mark product as delivered: ${error.toString()}`),
  })

  const deactivateProduct = useMutation({
    mutationKey: ['solog', 'deactivate', { cluster, productId }],
    mutationFn: async ({ title, reason }: {
      title: string,
      reason: string,
    }) => {
      if (!productPDA || !productQuery.data) throw new Error("Product not found")
      
      const [journalPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from("journal"),
          productPDA.toBuffer(),
          Buffer.from([productQuery.data.journalEntriesCount])
        ],
        program.programId
      )

      return program.methods
        .deactivateProduct(title, reason)
        .accounts({
          product: productPDA,
          journalEntry: journalPDA,
          handler: provider.publicKey,
          systemProgram: PublicKey.programId,
        })
        .rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return Promise.all([productQuery.refetch(), productJournalEntries.refetch(), journalEntries.refetch()])
    },
    onError: (error) => toast.error(`Failed to deactivate product: ${error.toString()}`),
  })

  return {
    productPDA,
    productQuery,
    productJournalEntries,
    addJournalEntry,
    transferProduct,
    markDelivered,
    deactivateProduct,
  }
}