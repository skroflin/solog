'use client'
import { useState } from 'react'
import Link from 'next/link'
import sologLogo from '../../../public/images/solog-logo.svg'
import Image from 'next/image'

const features: { title: string; description: string; icon: string }[] = [
  {
    title: "Enhanced Traceability",
    description: "Track products from source to consumer with immutable blockchain records, eliminating counterfeit goods and ensuring authenticity.",
    icon: "📦"
  },
  {
    title: "Transparent Supply Chain",
    description: "Create a shared, tamperproof ledger that connects inventory, information, and financial flows across all supply chain participants.",
    icon: "🔍"
  },
  {
    title: "Reduced Execution Errors",
    description: "Eliminate mistakes in inventory data, missing shipments, and duplicate payments with real-time verification and blockchain validation.",
    icon: "✓"
  },
  {
    title: "Streamlined Operations",
    description: "Automate supply chain processes with smart contracts that trigger actions when predefined conditions are met.",
    icon: "⚙️"
  },
  {
    title: "Dispute Resolution",
    description: "Resolve conflicts quickly with a complete, trustworthy audit trail of all supply chain activities.",
    icon: "🤝"
  },
  {
    title: "Improved Financing",
    description: "Enable better lending decisions and faster access to capital with verified transaction data.",
    icon: "💰"
  },
]

const benefits: { title: string; description: string }[] = [
  {
    title: "For Manufacturers",
    description: "Verify component authenticity, reduce counterfeits, and optimize inventory management."
  },
  {
    title: "For Distributors",
    description: "Improve logistics coordination, reduce delays, and enhance shipment visibility."
  },
  {
    title: "For Retailers",
    description: "Ensure product authenticity, improve customer trust, and streamline returns processing."
  },
  {
    title: "For Consumers",
    description: "Verify product origins, ensure authenticity, and access detailed product journey information."
  },
]

export default function DashboardFeature() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div>
      <div className="flex justify-center items-center p-0 mt-16 mb-8">
        <div className="h-48 w-64 relative">
          <Image
            alt='Solog Logo'
            priority
            src={sologLogo}
            layout='fill'
            objectFit='contain'
          />
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="tabs tabs-boxed justify-center mb-8">
          <a
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </a>
          <a
            className={`tab ${activeTab === 'features' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Features
          </a>
          <a
            className={`tab ${activeTab === 'benefits' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('benefits')}
          >
            Benefits
          </a>
          <a
            className={`tab ${activeTab === 'getstarted' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('getstarted')}
          >
            Get Started
          </a>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="hero bg-base-200 rounded-box p-6">
              <div className="hero-content flex-col lg:flex-row">
                <div>
                  <h1 className="text-3xl font-bold">Transforming Supply Chains with Blockchain</h1>
                  <p className="py-6">
                    Solog is a decentralized supply chain management system built on the Solana blockchain.
                    It creates a distributed, verifiable, and tamperproof ledger for recording transactions
                    among multiple parties in your supply chain.
                  </p>
                  <p className="py-2">
                    Unlike traditional ERP systems that struggle with visibility in complex supply chains,
                    Solog provides a complete audit trail integrating information flows, inventory flows,
                    and financial flows in one secure platform.
                  </p>
                  <Link href="/products/new" className="btn btn-primary mt-4">Create Your First Product</Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">The Problem</h2>
                  <hr />
                  <p>Traditional supply chains suffer from limited visibility, execution errors, and coordination challenges across multiple parties.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Difficult to trace products from source to consumer</li>
                    <li>Errors in inventory data and missing shipments</li>
                    <li>Challenges in verifying authenticity of products</li>
                    <li>Slow and expensive dispute resolution</li>
                  </ul>
                </div>
              </div>

              <div className="card bg-primary text-primary-content shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">The Solution</h2>
                  <hr />
                  <p>Solog leverages Solana blockchain to create a shared, immutable record of all supply chain activities.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Complete product traceability from origin to consumer</li>
                    <li>Tamperproof record of all transactions</li>
                    <li>Real-time visibility across the supply chain</li>
                    <li>Automated verification and authentication</li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Why Solana?</h2>
                  <hr />
                  <p>Solana provides the perfect foundation for supply chain management with:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>High throughput (65,000+ TPS)</li>
                    <li>Low transaction costs</li>
                    <li>Fast finality (400ms)</li>
                    <li>Energy-efficient proof of stake</li>
                    <li>Secure and decentralized infrastructure</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-8">Key Features of Solog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
                  <div className="card-body">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h2 className="card-title">{feature.title}</h2>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="divider my-12">How It Works</div>

            <div className="steps steps-vertical lg:steps-horizontal w-full">
              <div className="step step-primary">
                <div className="text-center px-4">
                  <h3 className="font-bold">Product Creation</h3>
                  <p className="text-sm">Create digital tokens for each product with unique identifiers</p>
                </div>
              </div>
              <div className="step step-primary">
                <div className="text-center px-4">
                  <h3 className="font-bold">Journal Entries</h3>
                  <p className="text-sm">Record each transaction and status change on the blockchain</p>
                </div>
              </div>
              <div className="step step-primary">
                <div className="text-center px-4">
                  <h3 className="font-bold">Ownership Transfer</h3>
                  <p className="text-sm">Securely transfer product ownership between supply chain partners</p>
                </div>
              </div>
              <div className="step step-primary">
                <div className="text-center px-4">
                  <h3 className="font-bold">Verification</h3>
                  <p className="text-sm">Verify product authenticity and history at any point</p>
                </div>
              </div>
              <div className="step step-secondary">
                <div className="text-center px-4">
                  <h3 className="font-bold">Delivery & Completion</h3>
                  <p className="text-sm">Mark products as delivered and maintain complete history</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-8">Benefits for Supply Chain Stakeholders</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">{benefit.title}</h2>
                    <p>{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-base-200 p-6 rounded-box">
              <h3 className="text-xl font-bold mb-4 divider">Real-World Applications</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-base-100">
                  <div className="card-body">
                    <h3 className="card-title text-lg">
                      <span className="text-2xl mr-2" role="img" aria-label="Pharmaceutical">💊</span>
                      Pharmaceutical Industry
                    </h3>
                    <p>Track prescription drugs to protect consumers from counterfeit, stolen, or harmful products.</p>
                  </div>
                </div>
                <div className="card bg-base-100">
                  <div className="card-body">
                    <h3 className="card-title text-lg">
                      <span className="text-2xl mr-2" role="img" aria-label="Food">🍎</span>
                      Food Supply
                    </h3>
                    <p>Trace fresh produce and food products to ensure safety and reduce waste.</p>
                  </div>
                </div>
                <div className="card bg-base-100">
                  <div className="card-body">
                    <h3 className="card-title text-lg">
                      <span className="text-2xl mr-2" role="img" aria-label="Manufacturing">🏭</span>
                      Manufacturing
                    </h3>
                    <p>Manage complex supply chains with thousands of components across many suppliers and locations.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-info mt-8">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>According to studies, blockchain-based supply chain solutions can reduce administrative costs by 20-50% and increase transparency by up to 60%.</span>
            </div>
          </div>
        )}

        {activeTab === 'getstarted' && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-8">Getting Started with Solog</h2>

            <div className="flex flex-col md:flex-row gap-6 mt-8">
              <div className="flex-1">
                <div className="steps steps-vertical w-full mb-8">
                  <div className="step step-primary">
                    <div className="ml-4">
                      <h3 className="font-bold">Connecting Your Wallet</h3>
                      <p className="text-sm">Connect your Solana wallet to access the Solog platform</p>
                    </div>
                  </div>
                  <div className="step step-primary">
                    <div className="ml-4">
                      <h3 className="font-bold">Create a Product</h3>
                      <p className="text-sm">Add your first product to the blockchain with details and description</p>
                    </div>
                  </div>
                  <div className="step step-primary">
                    <div className="ml-4">
                      <h3 className="font-bold">Add Journal Entries</h3>
                      <p className="text-sm">Record status updates, location changes, and other important events</p>
                    </div>
                  </div>
                  <div className="step step-secondary">
                    <div className="ml-4">
                      <h3 className="font-bold">Transfer Ownership</h3>
                      <p className="text-sm">Transfer product ownership to the next participant in your supply chain</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="card bg-primary text-primary-content shadow-xl h-full">
                  <div className="card-body">
                    <h2 className="card-title">Ready to Start?</h2>
                    <p>Begin tracking your supply chain on the blockchain in minutes.</p>
                    <div className="card-actions justify-center mt-4">
                      <Link href="/products" className="btn btn-lg">View Products</Link>
                      <Link href="/products/new" className="btn btn-lg btn-secondary">Create Product</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-success mt-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Need help getting started? Join our Discord community for support and guidance.</span>
            </div>
          </div>
        )}

        <div className="mt-12 bg-base-300 p-8 rounded-box">
          <blockquote className="text-xl italic">
            "A blockchain is valuable partly because it comprises a chronological string of blocks integrating all three types of flows in the transaction and captures details that aren't recorded in a financial-ledger system."
          </blockquote>
          <p className="text-right mt-4">— Harvard Business Review</p>
        </div>
      </div>
    </div>
  )
}