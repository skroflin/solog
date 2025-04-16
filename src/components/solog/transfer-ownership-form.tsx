'use client'
import { useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useProductAccount } from './solog-data-access'
import React from 'react'

export function TransferOwnershipForm({ productId }: { productId: string }) {
  const { transferProduct } = useProductAccount({ productId })
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    newLocation: '',
    newOwner: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newOwnerPubkey = new PublicKey(formData.newOwner)
      transferProduct.mutateAsync({
        title: formData.title,
        message: formData.message,
        newLocation: formData.newLocation,
        newOwner: newOwnerPubkey
      }).then(() => {
        setFormData({
          title: '',
          message: '',
          newLocation: '',
          newOwner: ''
        })
      })
    } catch (error) {
      console.error("Invalid public key:", error)
      alert("Invalid public key format")
    }
  }

  return (
    <div className="card card-bordered border-base-300 border-4 bg-base-100">
      <div className="card-body">
        <h2 className="card-title">Transfer Ownership</h2>
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
              value={formData.message}
              onChange={handleChange}
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
              value={formData.newLocation}
              onChange={handleChange}
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
              value={formData.newOwner}
              onChange={handleChange}
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
  )
}