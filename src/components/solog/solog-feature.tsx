'use client'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useSologProgram } from './solog-data-access'
import { CreateProductForm, ProductList } from './solog-ui'

export default function SologFeature() {
  const { publicKey } = useWallet()
  const { programId } = useSologProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Supply Chain Tracking"
        subtitle={
          'Create new products and track them through the supply chain. Add journal entries, transfer ownership, mark as delivered, or deactivate products when they complete their lifecycle.'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
      </AppHero>
      
      <div className="max-w-4xl mx-auto mb-10">
        <CreateProductForm />
      </div>
      
      <ProductList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}