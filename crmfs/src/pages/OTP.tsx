import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OTP() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    setError("")

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    
    if (pastedText.length === 6 && /^\d{6}$/.test(pastedText)) {
      setOtp(pastedText.split(""))
      setError("")
      // Automatically focus the last input after paste
      inputRefs.current[5]?.focus()
    } else {
      setError("Please paste a valid 6-digit code")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join("")
    
    if (code.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      navigate("/")
    }, 1500)
  }

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""])
    setTimeLeft(60)
    setError("")
    inputRefs.current[0]?.focus()
  }

  const isComplete = otp.join("").length === 6

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 sm:px-6 py-12 font-sans selection:bg-primary/20">
      
      {/* Brand / Logo Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-center gap-2"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <div className="h-5 w-5 rounded-sm border-2 border-current bg-transparent" />
        </div>
        <span className="text-xl font-semibold tracking-tight text-foreground">
          Nexus CRM
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] rounded-[24px] border border-border bg-card p-8 shadow-2xl space-y-8 relative overflow-hidden"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/signup")}
          className="absolute left-6 top-6 inline-flex items-center justify-center h-8 w-8 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="space-y-4 pt-6">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Shield className="h-7 w-7 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              Verify your email
            </h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to your email
            </p>
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3"
            >
              <p className="text-sm font-medium text-destructive">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="h-14 w-12 sm:h-16 sm:w-14 rounded-xl border border-border bg-background text-center text-2xl font-semibold text-foreground placeholder-muted-foreground transition-all focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none shadow-sm"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isComplete}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:scale-[0.98] active:scale-[0.97] transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Verifying...
              </motion.span>
            ) : (
              "Verify and continue"
            )}
          </Button>
        </form>

        {/* Resend OTP Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          {timeLeft > 0 ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Resend code in{" "}
                <span className="font-medium text-foreground tabular-nums">
                  0:{timeLeft.toString().padStart(2, '0')}
                </span>
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                className="w-full h-12 rounded-xl border border-border bg-background text-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 font-medium"
              >
                Resend code
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
} 