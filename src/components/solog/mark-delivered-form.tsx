'use client'
import { useState } from 'react'
import { useProductAccount } from './solog-data-access'
import React from 'react'

export function MarkDeliveredForm({ productId }: { productId: string }) {
  const { markDelivered } = useProductAccount({ productId })
  const [formData, setFormData] = useState({
    title: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    markDelivered.mutateAsync(formData)
      .then(() => {
        setFormData({
          title: '',
          message: ''
        })
      })
  }

  return (
    <div className="card card-bordered border-base-300 border-4 bg-base-100">
      <div className="card-body">
        <h2 className="card-title">Mark as Delivered</h2>
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
              placeholder="Delivery confirmation title"
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
  )
}