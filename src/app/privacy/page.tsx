'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#050510] text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <Link href="/kyc">
                    <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to KYC
                    </Button>
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-bold">Privacy Policy</h1>
                </div>

                <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-8 prose prose-invert max-w-none">
                        <p className="text-gray-300 text-sm mb-6">Last updated: February 2026</p>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">1. Introduction</h2>
                        <p className="text-gray-300">
                            Bitcoin Flash Protocol ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">2. Information We Collect</h2>
                        <p className="text-gray-300">We collect information that you provide directly to us, including:</p>
                        <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
                            <li>Personal identification information (name, email address, phone number)</li>
                            <li>Government-issued identification documents for KYC verification</li>
                            <li>Selfie photos for identity verification</li>
                            <li>Wallet addresses and transaction information</li>
                            <li>Communication data when you contact our support</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">3. How We Use Your Information</h2>
                        <p className="text-gray-300">We use the information we collect to:</p>
                        <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
                            <li>Verify your identity and comply with KYC/AML regulations</li>
                            <li>Process your transactions and maintain your account</li>
                            <li>Communicate with you about your account and our services</li>
                            <li>Detect and prevent fraud and unauthorized access</li>
                            <li>Improve our platform and develop new features</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">4. Data Security</h2>
                        <p className="text-gray-300">
                            We implement industry-standard security measures to protect your personal information. All sensitive data is encrypted using AES-256 encryption, and we use secure protocols for all data transmissions. Your KYC documents are stored in encrypted form and access is strictly limited to authorized personnel.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">5. Data Retention</h2>
                        <p className="text-gray-300">
                            We retain your personal information for as long as necessary to provide our services and comply with legal obligations. KYC documents are retained for the period required by applicable regulations, typically 5-7 years after account closure.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">6. Your Rights</h2>
                        <p className="text-gray-300">You have the right to:</p>
                        <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate or incomplete data</li>
                            <li>Request deletion of your data (subject to legal requirements)</li>
                            <li>Withdraw consent for data processing</li>
                            <li>Request a copy of your data in a portable format</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">7. Third-Party Sharing</h2>
                        <p className="text-gray-300">
                            We do not sell your personal information. We may share your information only with:
                        </p>
                        <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
                            <li>Service providers who assist in our operations</li>
                            <li>Legal authorities when required by law</li>
                            <li>Professional advisors as needed</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">8. Contact Us</h2>
                        <p className="text-gray-300">
                            If you have any questions about this Privacy Policy, please contact our support team at privacy@bitcoinflash.io
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
