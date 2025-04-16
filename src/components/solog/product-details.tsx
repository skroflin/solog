'use client'
import { useState } from 'react'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useProductAccount } from './solog-data-access'
import { JournalEntryForm } from './journal-entry-form'
import { TransferOwnershipForm } from './transfer-ownership-form'
import { MarkDeliveredForm } from './mark-delivered-form'
import { DeactivateProductForm } from './deactivate-product-form'

export function ProductDetails({ productId }: { productId: string }) {
  const { 
    productQuery, 
    productJournalEntries
  } = useProductAccount({ productId })

  if (productQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!productQuery.data) {
    return (
      <div className="alert alert-error">
        <span>Product not found</span>
      </div>
    )
  }

  const product = productQuery.data

  return (
    <div className="space-y-8">
      <div className="card card-bordered border-base-300 border-4 bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-2xl">{product.name}</h2>
          <div className="badge badge-lg badge-primary">{product.currentStatus}</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="font-bold">Product Details</h3>
              <p className="mt-2">{product.description}</p>
              <div className="mt-4 space-y-2">
                <div>
                  <span className="font-bold">Product ID:</span> {product.productId}
                </div>
                <div>
                  <span className="font-bold">Location:</span> {product.currentLocation}
                </div>
                <div>
                  <span className="font-bold">Status:</span> {product.isActive ? 'Active' : 'Inactive'}
                </div>
                <div>
                  <span className="font-bold">Journal Entries:</span> {product.journalEntriesCount}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold">Ownership Information</h3>
              <div className="mt-4 space-y-2">
                <div>
                  <span className="font-bold">Current Owner:</span>
                  <div className="mt-1">
                    <ExplorerLink 
                      path={`account/${product.currentOwner}`} 
                      label={ellipsify(product.currentOwner.toString())} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-bordered border-base-300 border-4 bg-base-100">
        <div className="card-body">
          <h2 className="card-title">Journal Entries</h2>
          
          {productJournalEntries.isLoading ? (
            <span className="loading loading-spinner loading-lg"></span>
          ) : productJournalEntries.data?.length ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Timestamp</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {productJournalEntries.data.map((entry) => (
                    <tr key={entry.publicKey.toString()}>
                      <td>{entry.account.entryNumber}</td>
                      <td>
                        <div className="font-bold">{entry.account.title}</div>
                        <div className="text-sm opacity-70">{entry.account.message}</div>
                      </td>
                      <td>{entry.account.status}</td>
                      <td>{entry.account.location}</td>
                      <td>{new Date(entry.account.timestamp.toNumber() * 1000).toLocaleString()}</td>
                      <td>
                        <ExplorerLink 
                          path={`account/${entry.account.owner}`} 
                          label={ellipsify(entry.account.owner.toString())} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">No journal entries found</div>
          )}
        </div>
      </div>

      {product.isActive && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <JournalEntryForm productId={productId} />
          <TransferOwnershipForm productId={productId} />
          <MarkDeliveredForm productId={productId} />
          <DeactivateProductForm productId={productId} />
        </div>
      )}

      {!product.isActive && (
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>This product has been deactivated and can no longer be modified.</span>
        </div>
      )}
    </div>
  )
}
