import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authApi } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")
    if (token) {
      login(token)
      toast.success("Welcome back!")
      navigate("/", { replace: true })
    }
  }, [searchParams, login, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    if (!email.includes("@")) {
      setError("Enter a valid email address")
      return
    }

    setIsLoading(true)
    try {
      const response = await authApi.login({ email, password })
      login(response.accessToken)
      toast.success("Welcome back!")
      navigate("/")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please check your credentials."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Redirect to Spring OAuth2 Google login
    window.location.href = "/oauth2/authorization/google"
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 sm:px-6 py-12 font-sans selection:bg-primary/20">
      
      {/* Brand / Logo Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-center gap-2"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground ">
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
        className="w-full max-w-[420px] rounded-[24px] border border-border bg-card p-8 space-y-8"
      >
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your sales pipeline
          </p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
              <p className="text-sm font-medium text-destructive">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground ml-1">
              Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                id="login-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="block text-sm font-medium text-foreground">
                Password
              </label>
              <Link
                to="#"
                className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <div className="pt-2">
            <Button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:scale-[0.98] active:scale-[0.97] transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center gap-2"
                >
                  Authenticating...
                </motion.span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative flex items-center pt-2">
          <div className="flex-grow border-t border-border" />
          <span className="mx-4 flex-shrink-0 text-xs text-muted-foreground bg-card px-2">
            or continue with
          </span>
          <div className="flex-grow border-t border-border" />
        </div>

        {/* Google Login */}
        <Button
          type="button"
          variant="outline"
          id="login-google"
          onClick={handleGoogleLogin}
          className="w-full h-12 rounded-xl border-border bg-background text-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 font-medium flex items-center justify-center gap-2"
        >
          {/* Google SVG icon */}
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </Button>
        <p className="text-center ">Dont have an account?  <a href="/signup" className="font-bold italic text-primary">Sign up</a></p>
      </motion.div>

      {/* Footer Links */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-foreground hover:underline underline-offset-4">
            Start a free trial
          </Link>
        </p>
      </motion.div>
    </div>
  )
}