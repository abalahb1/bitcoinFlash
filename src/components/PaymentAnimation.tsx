'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Loader2, 
  Zap, 
  Shield, 
  Activity, 
  CheckCircle2, 
  Globe,
  Lock,
  Wifi,
  Database,
  Server,
  Radio,
  Cpu,
  Hash,
  Share2,
  Wallet
} from 'lucide-react'

interface PaymentAnimationProps {
  isOpen: boolean
  onComplete: () => void
  packageName: string
  amount: number
}

// Replaced Mining Pools with Centralized Exchanges (CEXs)
const bitcoinValidators = [
  { name: 'Binance', type: 'Exchange', status: 'verifying' },
  { name: 'Coinbase', type: 'Exchange', status: 'verifying' },
  { name: 'Kraken', type: 'Exchange', status: 'verifying' },
  { name: 'KuCoin', type: 'Exchange', status: 'verifying' },
  { name: 'Bybit', type: 'Exchange', status: 'verifying' },
]

// Wallets for the connection phase
const targetWallets = [
  { name: 'Trust Wallet', type: 'Web3', status: 'connecting' },
  { name: 'MetaMask', type: 'Web3', status: 'connecting' },
  { name: 'Ledger Live', type: 'Hardware', status: 'connecting' },
  { name: 'Exodus', type: 'Desktop', status: 'connecting' },
]

const steps = [
  { id: 1, label: 'Initializing Flash Protocol', icon: Zap, duration: 1500 },
  { id: 2, label: 'Broadcasting to Mempool', icon: Radio, duration: 2000 },
  { id: 3, label: 'Verifying with Exchanges', icon: Server, duration: 3000 },
  { id: 4, label: 'Establishing Wallet Connections', icon: Wallet, duration: 15000 }, // 15 seconds duration as requested
  { id: 5, label: 'Consensus Achievement', icon: Share2, duration: 2500 },
  { id: 6, label: 'Generating Merkle Root', icon: Hash, duration: 2000 },
  { id: 7, label: 'Propagating to Network', icon: Globe, duration: 1500 },
  { id: 8, label: 'Awaiting Confirmations', icon: Shield, duration: 2000 },
  { id: 9, label: 'Flash Transaction Complete', icon: CheckCircle2, duration: 1000 },
]

export function PaymentAnimation({ isOpen, onComplete, packageName, amount }: PaymentAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [matrixCode, setMatrixCode] = useState<string[]>([])
  const [validatorStatuses, setValidatorStatuses] = useState(bitcoinValidators)
  const [walletStatuses, setWalletStatuses] = useState(targetWallets)
  const [transactionHash, setTransactionHash] = useState('')

  // Generate random transaction hash
  useEffect(() => {
    if (currentStep === 6) { // Updated index due to added step
      const hash = Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
      setTransactionHash(hash)
    }
  }, [currentStep])

  // Matrix rain effect
  useEffect(() => {
    if (!isOpen) return
    
    const interval = setInterval(() => {
      const newCode = Array.from({ length: 50 }, () => {
        const chars = '01BTC₿BLOCKCHAIN'
        return chars[Math.floor(Math.random() * chars.length)]
      })
      setMatrixCode(newCode)
    }, 100)

    return () => clearInterval(interval)
  }, [isOpen])

  // Validator Animation Effect
  useEffect(() => {
    if (!isOpen || currentStep !== 2) return

    const updateValidators = setInterval(() => {
      setValidatorStatuses(prev => 
        prev.map((validator) => ({
          ...validator,
          status: Math.random() > 0.4 ? 'confirmed' : 'verifying'
        }))
      )
    }, 400)

    return () => clearInterval(updateValidators)
  }, [isOpen, currentStep])

  // Wallet Connection Animation Effect
  useEffect(() => {
    if (!isOpen || currentStep !== 3) return // Step 4 is index 3 in our array (Initializing -> Broadcasting -> Verifying -> Establishing Connections)

    const updateWallets = setInterval(() => {
      setWalletStatuses(prev => 
        prev.map((wallet) => ({
          ...wallet,
          status: Math.random() > 0.2 ? 'connected' : 'handshaking'
        }))
      )
    }, 800)

    return () => clearInterval(updateWallets)
  }, [isOpen, currentStep])

  // Main Stepper Logic
  useEffect(() => {
    if (!isOpen || currentStep >= steps.length) return

    const step = steps[currentStep]
    let progressInterval: NodeJS.Timeout
    let stepTimeout: NodeJS.Timeout

    // Animate progress bar
    const startTime = Date.now()
    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / step.duration) * 100, 100)
      setProgress(newProgress)
    }, 50)

    // Move to next step
    stepTimeout = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1)
        setProgress(0)
      } else {
        setTimeout(() => {
          onComplete()
        }, 2000)
      }
    }, step.duration)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(stepTimeout)
    }
  }, [isOpen, currentStep, onComplete])

  if (!isOpen) return null

  const StepIcon = steps[currentStep]?.icon || Loader2

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      >
        {/* Matrix Background */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="grid grid-cols-20 gap-2 text-orange-500 font-mono text-xs">
            {matrixCode.map((char, idx) => (
              <motion.div
                key={idx}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
              >
                {char}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-4xl mx-4">
          {/* Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                <Zap className="w-12 h-12 text-black" />
              </div>
            </motion.div>
            <h2 className="text-4xl font-bold text-white mb-2">Generating Flash BTC</h2>
            <p className="text-gray-400 text-lg">{packageName} - {amount} BTC</p>
          </motion.div>

          {/* Current Step */}
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border border-orange-500/30 rounded-2xl p-8 mb-8 backdrop-blur-md"
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: currentStep < 8 ? 360 : 0 }}
                transition={{ duration: 1, repeat: currentStep < 8 ? Infinity : 0, ease: "linear" }}
              >
                <StepIcon className={`w-8 h-8 ${currentStep === 8 ? 'text-green-500' : 'text-orange-500'}`} />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white">{steps[currentStep]?.label}</h3>
                <div className="mt-3 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full ${currentStep === 8 ? 'bg-green-500' : 'bg-gradient-to-r from-orange-500 to-yellow-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Step {currentStep + 1}/{steps.length}</div>
              </div>
            </div>

            {/* Transaction Hash */}
            {currentStep >= 5 && transactionHash && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-black/40 rounded-lg border border-orange-500/20"
              >
                <div className="text-xs text-gray-400 mb-1">Flash Transaction Hash:</div>
                <div className="font-mono text-xs text-orange-400 break-all">{transactionHash}</div>
              </motion.div>
            )}
          </motion.div>

          {/* Validator Status Grid (Exchanges) */}
          {currentStep >= 2 && currentStep < 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
            >
              {validatorStatuses.map((validator, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-black/40 border border-white/10 rounded-lg p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={{ 
                        scale: validator.status === 'confirmed' ? [1, 1.2, 1] : 1,
                        backgroundColor: validator.status === 'confirmed' ? '#10b981' : '#f59e0b'
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 rounded-full"
                    />
                    <Server className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="text-xs font-semibold text-white mb-1">{validator.name}</div>
                  <div className={`text-[10px] mt-1 ${validator.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {validator.status.toUpperCase()}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Wallet Connection Status Grid */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              {walletStatuses.map((wallet, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-black/40 border border-orange-500/20 rounded-lg p-4 backdrop-blur-sm relative overflow-hidden"
                >
                   {/* Scanning Effect */}
                   <motion.div 
                     className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent"
                     animate={{ x: ['-100%', '100%'] }}
                     transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                   />
                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <motion.div
                      animate={{ 
                        scale: wallet.status === 'connected' ? [1, 1.2, 1] : 1,
                        backgroundColor: wallet.status === 'connected' ? '#10b981' : '#f59e0b'
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 rounded-full"
                    />
                    <Wallet className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="text-xs font-semibold text-white mb-1 relative z-10">{wallet.name}</div>
                  <div className={`text-[10px] mt-1 relative z-10 ${wallet.status === 'connected' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {wallet.status.toUpperCase()}...
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Success State */}
          {currentStep === 8 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block"
              >
                <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-3xl font-bold text-green-500 mb-2">Flash BTC Generated!</h3>
              <p className="text-gray-400">Your assets have been successfully transmitted to the blockchain</p>
            </motion.div>
          )}

          {/* Technical Info Footer - Updated */}
          <div className="mt-8 flex items-center justify-center gap-8 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Network: Bitcoin Core</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Protocol: BIP-340</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Speed: Flash</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
