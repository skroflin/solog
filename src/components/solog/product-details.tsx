'use client'
import { useState } from 'react'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useProductAccount } from './solog-data-access'
import { JournalEntryForm } from './journal-entry-form'
import { TransferOwnershipForm } from './transfer-ownership-form'
import { MarkDeliveredForm } from './mark-delivered-form'
import { DeactivateProductForm } from './deactivate-product-form'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import loadingLogo from '../../../public/images/loading-final.svg'

export function ProductDetails({ productId }: { productId: string }) {
  const {
    productQuery,
    productJournalEntries
  } = useProductAccount({ productId })

  const [isDisputeOpen, setIsDisputeOpen] = useState(false)
  const [disputeData, setDisputeData] = useState({
    title: '',
    description: '',
    evidence: ''
  })

  if (productQuery.isLoading) {
    return (
      <span>
        <div className="flex justify-center items-center">
          <div className='w-96 h-auto'>
            <Image
              src={loadingLogo}
              alt='Loading Logo'
            />
          </div>
        </div>
      </span>
    )
  }

  if (!productQuery.data) {
    return (
      <div className="alert alert-error">
        <span>Product not found</span>
      </div>
    )
  }

  const product = productQuery.data

  const handleDisputeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDisputeData(prev => ({ ...prev, [name]: value }))
  }

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Dispute submitted:', disputeData)
    setIsDisputeOpen(false)
    setDisputeData({
      title: '',
      description: '',
      evidence: ''
    })
  }

  const exportData = {
    product: {
      id: product.productId,
      name: product.name,
      description: product.description,
      status: product.currentStatus,
      location: product.currentLocation,
      isActive: product.isActive,
      entriesCount: product.journalEntriesCount
    },
    journalEntries: productJournalEntries.data?.map(entry => ({
      title: entry.account.title,
      message: entry.account.message,
      status: entry.account.status,
      location: entry.account.location,
      timestamp: new Date(entry.account.timestamp.toNumber() * 1000).toISOString(),
      entryNumber: entry.account.entryNumber
    })) || []
  }

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `product-${product.productId}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'badge-success'
      case 'in transit': return 'badge-warning'
      case 'processing': return 'badge-info'
      case 'delayed': return 'badge-error'
      default: return 'badge-neutral'
    }
  }

  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${productId}` : ''

  return (
    <div className="space-y-8">
      <div className="card card-bordered border-base-300 border-4 bg-base-100">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="card-title text-2xl">{product.name}</h2>
              <div className={`badge badge-lg ${getStatusColor(product.currentStatus)} mt-2`}>
                {product.currentStatus}
              </div>
            </div>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-sm m-1">Export Data</label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
                <li><a onClick={downloadJSON}>Export as JSON</a></li>
              </ul>
            </div>
          </div>

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

              <div className="mt-6">
                <h3 className="font-bold">Product QR Code</h3>
                <div className="flex justify-center mt-2">
                  {productUrl && (
                    <div className="bg-white p-2 rounded">
                      <QRCodeSVG value={productUrl} size={150} />
                    </div>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <button className="btn btn-sm btn-outline" onClick={() => window.print()}>
                    Print QR Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {productJournalEntries.data && productJournalEntries.data.length > 0 && (
        <div className="card card-bordered border-base-300 border-4 bg-base-100">
          <div className="card-body">
            <h2 className="card-title">Product Timeline</h2>
            <div className="mt-4">
              <ul className="timeline timeline-vertical">
                {productJournalEntries.data.map((entry, index) => (
                  <li key={entry.publicKey.toString()}>
                    <div className="timeline-start">{new Date(entry.account.timestamp.toNumber() * 1000).toLocaleString()}</div>
                    <div className="timeline-middle">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="timeline-end timeline-box">
                      <div className="font-bold">{entry.account.title}</div>
                      <p>{entry.account.message}</p>
                      <div className="flex gap-2 mt-2">
                        <div className={`badge ${getStatusColor(entry.account.status)}`}>{entry.account.status}</div>
                        <div className="badge badge-outline">{entry.account.location}</div>
                      </div>
                    </div>
                    {index !== productJournalEntries.data.length - 1 && <hr />}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

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
                      <td>
                        <div className={`badge ${getStatusColor(entry.account.status)}`}>
                          {entry.account.status}
                        </div>
                      </td>
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

      <div className="card card-bordered border-base-300 border-4 bg-base-100">
        <div className="card-body">
          <h2 className="card-title">Product Verification</h2>
          <div className="flex justify-between items-center">
            <div>
              <p>Report any issues or discrepancies with this product's information.</p>
            </div>
            <button
              className="btn btn-outline btn-warning"
              onClick={() => setIsDisputeOpen(true)}
            >
              Report Issue
            </button>
          </div>

          <div className="mt-4">
            <button
              className="btn btn-outline btn-primary"
              onClick={() => toast.custom((t) => (
                <div
                  className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Ownership Certificate Update
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          The ownership certificate feature will be implemented in the future!
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-l border-gray-200">
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ))}
            >
              Download Ownership Certificate
            </button>
          </div>
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

      {isDisputeOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Report Product Issue</h3>
            <form onSubmit={handleDisputeSubmit} className="mt-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Issue Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={disputeData.title}
                  onChange={handleDisputeChange}
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
                  value={disputeData.description}
                  onChange={handleDisputeChange}
                  className="textarea textarea-bordered"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Supporting Evidence</span>
                </label>
                <textarea
                  name="evidence"
                  value={disputeData.evidence}
                  onChange={handleDisputeChange}
                  className="textarea textarea-bordered"
                  placeholder="Provide links or descriptions of evidence"
                />
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">Submit</button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsDisputeOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
