import './globals.css'
import { ClusterProvider } from '@/components/cluster/cluster-data-access'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { UiLayout } from '@/components/ui/ui-layout'
import { ReactQueryProvider } from './react-query-provider'
import BlockchainSupplyChainLogoS from '@/components/logo/logo'

export const metadata = {
  title: 'Solog',
}

const links: { label: string; path: string }[] = [
  { label: 'Account', path: '/account' },
  { label: 'Clusters', path: '/clusters' },
  { label: 'Supply Chain Administration', path: '/solog' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <ClusterProvider>
            <SolanaProvider>
              <UiLayout 
                links={links}
                logo={<BlockchainSupplyChainLogoS className="h-8 w-auto text-primary"/>}
              >
                {children}
              </UiLayout>
            </SolanaProvider>
          </ClusterProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
