import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api";
import { toast } from "sonner";
import { 
  Building2, 
  ChevronRight, 
  ChevronLeft, 
  Rocket,
  CheckCircle2,
  Globe2,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const industries = [
  "Technology", "Real Estate", "Healthcare", "Finance", 
  "Education", "Retail", "Manufacturing", "Other"
];

const companySizes = [
  "1-10", "11-50", "51-200", "201-500", "501+"
];

const roles = [
  "Founder/CEO", "Sales Manager", "Marketing", "Operations", 
  "IT/Technical", "Other"
];

export default function Onboarding() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    role: "",
  });

  useEffect(() => {
    if (user?.setupCompleted) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinish = async () => {
    if (!formData.companyName || !formData.industry || !formData.companySize || !formData.role) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await userApi.updateProfile({
        ...formData,
        setupCompleted: true
      });
      setUser(updatedUser);
      toast.success("Welcome aboard! Let's build something great.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete setup");
    } finally {
      setIsLoading(false);
    }
  };

  const currentProgress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[480px] relative z-10">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4 px-1">
            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-widest">
              Step {step} of 3
            </span>
            <span className="text-[12px] font-semibold text-primary">
              {Math.round(currentProgress)}% Complete
            </span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${currentProgress}%` }}
              className="h-full bg-primary"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-apple-lg backdrop-blur-sm bg-card/80">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight">Let's set up your workspace</h1>
                  <p className="text-muted-foreground text-[14px]">This will be the heart of your CRM operations.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium ml-1">Company Name</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text"
                        placeholder="e.g. Acme Industries"
                        className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={formData.companyName}
                        onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={nextStep}
                  disabled={!formData.companyName}
                  className="w-full bg-primary text-primary-foreground h-12 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Globe2 className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight">Tell us more about {formData.companyName}</h1>
                  <p className="text-muted-foreground text-[14px]">We'll personalize your experience based on your industry.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium ml-1">Industry</label>
                    <div className="grid grid-cols-2 gap-2">
                      {industries.map(ind => (
                        <button
                          key={ind}
                          onClick={() => setFormData({ ...formData, industry: ind })}
                          className={cn(
                            "px-3 py-2.5 rounded-xl border text-[13px] font-medium transition-all text-left",
                            formData.industry === ind 
                              ? "bg-primary/5 border-primary text-primary shadow-sm"
                              : "border-border hover:border-primary/50 text-muted-foreground"
                          )}
                        >
                          {ind}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-medium ml-1">Company Size</label>
                    <div className="flex flex-wrap gap-2">
                      {companySizes.map(size => (
                        <button
                          key={size}
                          onClick={() => setFormData({ ...formData, companySize: size })}
                          className={cn(
                            "px-4 py-2 rounded-xl border text-[13px] font-medium transition-all",
                            formData.companySize === size 
                              ? "bg-primary/5 border-primary text-primary shadow-sm"
                              : "border-border hover:border-primary/50 text-muted-foreground"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={prevStep}
                    className="flex-1 border border-border h-12 rounded-xl text-[14px] font-medium hover:bg-muted transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.industry || !formData.companySize}
                    className="flex-[2] bg-primary text-primary-foreground h-12 rounded-xl text-[14px] font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight">One last thing...</h1>
                  <p className="text-muted-foreground text-[14px]">What is your primary role at the company?</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {roles.map(role => (
                      <button
                        key={role}
                        onClick={() => setFormData({ ...formData, role: role })}
                        className={cn(
                          "px-4 py-3.5 rounded-xl border text-[14px] font-medium transition-all flex items-center justify-between",
                          formData.role === role 
                            ? "bg-primary/5 border-primary text-primary shadow-sm"
                            : "border-border hover:border-primary/50 text-muted-foreground"
                        )}
                      >
                        {role}
                        {formData.role === role && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={prevStep}
                    className="flex-1 border border-border h-12 rounded-xl text-[14px] font-medium hover:bg-muted transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button 
                    onClick={handleFinish}
                    disabled={!formData.role || isLoading}
                    className="flex-[2] bg-primary text-primary-foreground h-12 rounded-xl text-[14px] font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? "Starting up..." : "Complete Setup"}
                    {!isLoading && <Rocket className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-muted-foreground text-[12px] mt-8 flex items-center justify-center gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          Enterprise-grade security by Antigravity CRM
        </p>
      </div>
    </div>
  );
}
