'use client'
import { PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useSologProgram, useProductAccount } from './solog-data-access'

export function CreateProductForm() {
  const { createProduct } = useSologProgram()
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    description: '',
    initialNotes: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createProduct.mutateAsync(formData)
      .then(() => {
        setFormData({
          productId: '',
          name: '',
          description: '',
          initialNotes: ''
        })
      })
  }

  return (
    <div className="card card-bordered border-base-300 border-4 p-4 mb-4">
      <h2 className="text-2xl font-bold mb-4">Create New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Product ID</span>
          </label>
          <input
            type="text"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            placeholder="Enter unique product ID"
            className="input input-bordered"
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Product Name</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            className="input input-bordered"
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            className="textarea textarea-bordered"
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Initial Notes</span>
          </label>
          <textarea
            name="initialNotes"
            value={formData.initialNotes}
            onChange={handleChange}
            placeholder="Enter initial notes"
            className="textarea textarea-bordered"
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={createProduct.isPending}
        >
          {createProduct.isPending ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  )
}

export function ProductList() {
  const { products, getProgramAccount } = useSologProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }

  return (
    <div className={'space-y-6'}>
      <h2 className="text-2xl font-bold">Products</h2>
      {products.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : products.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {products.data?.map((product) => (
            <ProductCard 
              key={product.publicKey.toString()} 
              productId={product.account.productId} 
              productPDA={product.publicKey} 
              data={product.account}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No products</h2>
          No products found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function ProductCard({ productId, productPDA, data }: { 
  productId: string, 
  productPDA: PublicKey,
  data: any
}) {
  const { productQuery } = useProductAccount({ productId })
  const product = useMemo(() => productQuery.data || data, [productQuery.data, data])

  return (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content mb-8">
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <div className="badge badge-primary">{product.currentStatus}</div>
        <p className="text-sm">{product.description}</p>
        <div className="flex flex-col gap-2 mt-2">
          <div className="text-sm">
            <span className="font-bold">Location:</span> {product.currentLocation}
          </div>
          <div className="text-sm">
            <span className="font-bold">Owner:</span> {ellipsify(product.currentOwner.toString())}
          </div>
          <div className="text-sm">
            <span className="font-bold">Status:</span> {product.isActive ? 'Active' : 'Inactive'}
          </div>
          <div className="text-sm">
            <span className="font-bold">Journal Entries:</span> {product.journalEntriesCount}
          </div>
        </div>
        <div className="card-actions justify-end mt-4">
          <ProductDetailsButton productId={productId} />
        </div>
      </div>
    </div>
  )
}

function ProductDetailsButton({ productId }: { productId: string }) {
  return (
    <a href={`/product/${productId}`} className="btn btn-primary btn-sm">
      View Details
    </a>
  )
}

export function ProductDetails({ productId }: { productId: string }) {
  const { 
    productQuery, 
    productJournalEntries, 
    addJournalEntry, 
    transferProduct, 
    markDelivered, 
    deactivateProduct 
  } = useProductAccount({ productId })

  const [journalFormData, setJournalFormData] = useState({
    title: '',
    message: '',
    newStatus: '',
    newLocation: ''
  })

  const [transferFormData, setTransferFormData] = useState({
    title: 'Ownership Transfer',
    message: '',
    newLocation: '',
    newOwner: ''
  })

  const [deliveryFormData, setDeliveryFormData] = useState({
    title: 'Product Delivered',
    message: ''
  })

  const [deactivateFormData, setDeactivateFormData] = useState({
    title: 'Product Deactivated',
    reason: ''
  })

  const handleJournalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setJournalFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTransferChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTransferFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDeliveryFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDeactivateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDeactivateFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addJournalEntry.mutateAsync(journalFormData)
      .then(() => {
        setJournalFormData({
          title: '',
          message: '',
          newStatus: '',
          newLocation: ''
        })
      })
  }

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newOwnerPublicKey = new PublicKey(transferFormData.newOwner)
      transferProduct.mutateAsync({
        ...transferFormData,
        newOwner: newOwnerPublicKey
      }).then(() => {
        setTransferFormData({
          title: 'Ownership Transfer',
          message: '',
          newLocation: '',
          newOwner: ''
        })
      })
    } catch (error) {
      alert('Invalid public key for new owner')
    }
  }

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    markDelivered.mutateAsync(deliveryFormData)
      .then(() => {
        setDeliveryFormData({
          title: 'Product Delivered',
          message: ''
        })
      })
  }

  const handleDeactivateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    deactivateProduct.mutateAsync(deactivateFormData)
      .then(() => {
        setDeactivateFormData({
          title: 'Product Deactivated',
          reason: ''
        })
      })
  }

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
                <div>
                  <span className="font-bold">Creator:</span>
                  <div className="mt-1">
                    <ExplorerLink 
                      path={`account/${product.creator}`} 
                      label={ellipsify(product.creator.toString())} 
                    />
                  </div>
                </div>
                <div>
                  <span className="font-bold">Product Address:</span>
                  <div className="mt-1">
                    <ExplorerLink 
                      path={`account/${productQuery.data ? productQuery.data.publicKey : ''}`} 
                      label={ellipsify(productQuery.data ? productQuery.data.publicKey.toString() : '')} 
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
                    <th>Handler</th>
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
                          path={`account/${entry.account.handler}`} 
                          label={ellipsify(entry.account.handler.toString())} 
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
          <div className="card card-bordered border-base-300 border-4 bg-base-100">
            <div className="card-body">
            <h2 className="card-title">Add Journal Entry</h2>
              <form onSubmit={handleJournalSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={journalFormData.title}
                    onChange={handleJournalChange}
                    placeholder="Entry title"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Message</span>
                  </label>
                  <textarea
                    name="message"
                    value={journalFormData.message}
                    onChange={handleJournalChange}
                    placeholder="Entry details"
                    className="textarea textarea-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">New Status</span>
                  </label>
                  <input
                    type="text"
                    name="newStatus"
                    value={journalFormData.newStatus}
                    onChange={handleJournalChange}
                    placeholder="Updated status"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">New Location</span>
                  </label>
                  <input
                    type="text"
                    name="newLocation"
                    value={journalFormData.newLocation}
                    onChange={handleJournalChange}
                    placeholder="Updated location"
                    className="input input-bordered"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={addJournalEntry.isPending}
                >
                  {addJournalEntry.isPending ? 'Adding...' : 'Add Entry'}
                </button>
              </form>
            </div>
          </div>

          <div className="card card-bordered border-base-300 border-4 bg-base-100">
            <div className="card-body">
              <h2 className="card-title">Transfer Ownership</h2>
              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={transferFormData.title}
                    onChange={handleTransferChange}
                    placeholder="Transfer title"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Message</span>
                  </label>
                  <textarea
                    name="message"
                    value={transferFormData.message}
                    onChange={handleTransferChange}
                    placeholder="Transfer details"
                    className="textarea textarea-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">New Location</span>
                  </label>
                  <input
                    type="text"
                    name="newLocation"
                    value={transferFormData.newLocation}
                    onChange={handleTransferChange}
                    placeholder="New location after transfer"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">New Owner (Public Key)</span>
                  </label>
                  <input
                    type="text"
                    name="newOwner"
                    value={transferFormData.newOwner}
                    onChange={handleTransferChange}
                    placeholder="New owner's public key"
                    className="input input-bordered"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={transferProduct.isPending}
                >
                  {transferProduct.isPending ? 'Transferring...' : 'Transfer Ownership'}
                </button>
              </form>
            </div>
          </div>

          <div className="card card-bordered border-base-300 border-4 bg-base-100">
            <div className="card-body">
              <h2 className="card-title">Mark as Delivered</h2>
              <form onSubmit={handleDeliverySubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={deliveryFormData.title}
                    onChange={handleDeliveryChange}
                    placeholder="Delivery title"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Message</span>
                  </label>
                  <textarea
                    name="message"
                    value={deliveryFormData.message}
                    onChange={handleDeliveryChange}
                    placeholder="Delivery details"
                    className="textarea textarea-bordered"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={markDelivered.isPending}
                >
                  {markDelivered.isPending ? 'Processing...' : 'Mark as Delivered'}
                </button>
              </form>
            </div>
          </div>

          <div className="card card-bordered border-base-300 border-4 bg-base-100">
            <div className="card-body">
              <h2 className="card-title">Deactivate Product</h2>
              <form onSubmit={handleDeactivateSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={deactivateFormData.title}
                    onChange={handleDeactivateChange}
                    placeholder="Deactivation title"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Reason</span>
                  </label>
                  <textarea
                    name="reason"
                    value={deactivateFormData.reason}
                    onChange={handleDeactivateChange}
                    placeholder="Reason for deactivation"
                    className="textarea textarea-bordered"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-warning w-full"
                  disabled={deactivateProduct.isPending}
                >
                  {deactivateProduct.isPending ? 'Deactivating...' : 'Deactivate Product'}
                </button>
              </form>
            </div>
          </div>
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
