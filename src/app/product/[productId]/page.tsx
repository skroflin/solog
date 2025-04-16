'use client'

import { ProductDetails } from '@/components/solog/product-details'
import { AppHero } from '@/components/ui/ui-layout'
import { useParams } from 'next/navigation'

export default function ProductPage() {
  const params = useParams()
  const productId = params.productId as string

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <AppHero
        title="Product Details"
        subtitle="View and manage product information, journal entries, and ownership"
      />
      
      <div className="mt-8">
        <ProductDetails productId={productId} />
      </div>
    </div>
  )
}
