'use client'
import { useState } from 'react'
import { useProductAccount } from './solog-data-access'

export function JournalEntryForm({ productId }: { productId: string }) {
  const { addJournalEntry } = useProductAccount({ productId })
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    newStatus: '',
    newLocation: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addJournalEntry.mutateAsync(formData)
      .then(() => {
        setFormData({
          title: '',
          message: '',
          newStatus: '',
          newLocation: ''
        })
      })
  }

  return (
    <div className="card card-bordered border-base-300 border-4 bg-base-100">
      <div className="card-body">
        <h2 className="card-title">Add Journal Entry</h2>
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
              value={formData.message}
              onChange={handleChange}
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
              value={formData.newStatus}
              onChange={handleChange}
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
              value={formData.newLocation}
              onChange={handleChange}
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
  )
}