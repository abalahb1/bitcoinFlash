'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
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
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h1 className="text-3xl font-bold">Terms of Service</h1>
                </div>

                <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-8 prose prose-invert max-w-none">
                        <p className="text-gray-300 text-sm mb-6">Last updated: February 2026</p>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-300">
                            By accessing or using Bitcoin Flash Protocol services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">2. Service Description</h2>
                        <p className="text-gray-300">
                            Bitcoin Flash Protocol provides a platform for creating and managing Flash Bitcoin transactions. Our Flash BTC technology allows for rapid transaction creation and distribution through our secure network.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">3. Flash Bitcoin Features</h2>
                        <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
                            <li>Transactions are displayed on blockchain explorers</li>
                            <li>Flash BTC can be stored in any compatible wallet</li>
                            <li>Transactions are confirmed within the network</li>
                            <li>Multiple package tiers available based on your needs</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">4. Transaction Process</h2>
                        <p className="text-gray-300">The Flash BTC transaction process works as follows:</p>
                        <ol className="list-decimal pl-6 text-gray-300 space-y-2 mt-2">
                            <li>Select your desired package from the available tiers</li>
                            <li>Complete the payment using your preferred method</li>
                            <li>Provide the destination wallet address</li>
                            <li>Our system processes and initiates the Flash transaction</li>
                            <li>Receive confirmation and track your transaction</li>
                        </ol>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">5. User Requirements</h2>
                        <p className="text-gray-300">To use our services, you must:</p>
                        <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
                            <li>Be at least 18 years of age</li>
                            <li>Complete KYC verification</li>
                            <li>Provide accurate and truthful information</li>
                            <li>Not use the service for illegal activities</li>
                            <li>Maintain the security of your account credentials</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">6. Commission Structure</h2>
                        <p className="text-gray-300">
                            Verified agents may earn commissions on transactions and referrals. Commission rates vary by account tier (Bronze, Silver, Gold) and are paid according to our commission schedule.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">7. Prohibited Activities</h2>
                        <p className="text-gray-300">You agree not to:</p>
                        <ul className="list-disc pl-6 text-gray-300 space-y-2 mt-2">
                            <li>Use the service for money laundering or fraud</li>
                            <li>Attempt to manipulate or exploit the system</li>
                            <li>Share your account credentials with others</li>
                            <li>Violate any applicable laws or regulations</li>
                            <li>Interfere with the platform's security measures</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">8. Limitation of Liability</h2>
                        <p className="text-gray-300">
                            Bitcoin Flash Protocol shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability is limited to the amount you have paid for the specific transaction in question.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">9. Modifications</h2>
                        <p className="text-gray-300">
                            We reserve the right to modify these Terms of Service at any time. Continued use of the service after modifications constitutes acceptance of the updated terms.
                        </p>

                        <h2 className="text-xl font-semibold text-white mt-6 mb-4">10. Contact</h2>
                        <p className="text-gray-300">
                            For questions about these Terms of Service, please contact support@bitcoinflash.io
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
