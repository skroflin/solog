'use client'
import { useState } from 'react'
import { useProductAccount } from './solog-data-access'
import React from 'react'

export function DeactivateProductForm({ productId }: { productId: string }) {
  const { deactivateProduct } = useProductAccount({ productId })
  const [formData, setFormData] = useState({
    title: '',
    reason: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (window.confirm('Are you sure you want to deactivate this product? This action cannot be undone.')) {
      deactivateProduct.mutateAsync(formData)
        .then(() => {
          setFormData({
            title: '',
            reason: ''
          })
        })
    }
  }

  return (
    <div className="card card-bordered border-base-300 border-4 bg-base-100 border-error">
      <div className="card-body">
        <h2 className="card-title text-error">Deactivate Product</h2>
        <div className="alert alert-warning mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Warning: This action cannot be undone. Once deactivated, the product cannot be modified.</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
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
              value={formData.reason}
              onChange={handleChange}
              placeholder="Reason for deactivation"
              className="textarea textarea-bordered"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-error w-full"
            disabled={deactivateProduct.isPending}
          >
            {deactivateProduct.isPending ? 'Deactivating...' : 'Deactivate Product'}
          </button>
        </form>
      </div>
    </div>
  )
}