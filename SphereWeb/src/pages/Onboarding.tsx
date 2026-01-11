import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Shield, 
  TrendingUp, 
  PiggyBank,
  Building2,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SlideProps {
  children: React.ReactNode;
  direction: number;
}

const SlideWrapper = ({ children, direction }: SlideProps) => (
  <motion.div
    initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="absolute inset-0 flex flex-col items-center justify-center px-6"
  >
    {children}
  </motion.div>
);

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [connectedBanks, setConnectedBanks] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast({
      title: "Welcome to Sphere!",
      description: "Successfully signed in with Google",
    });
    nextSlide();
  };

  const handlePlaidConnect = async () => {
    setIsLoading(true);
    // Simulate Plaid Link flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnectedBanks(['Chase Bank', 'Bank of America']);
    setIsLoading(false);
    toast({
      title: "Banks Connected!",
      description: "Successfully linked 2 accounts",
    });
    nextSlide();
  };

  const handleComplete = () => {
    navigate('/overview');
  };

  const slides = [
    // Slide 0: Welcome
    {
      content: (
        <SlideWrapper direction={direction}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-8"
          >
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground text-center mb-4">
            Welcome to Sphere
          </h1>
          <p className="text-muted-foreground text-center max-w-sm mb-8">
            Your personal finance companion that helps you spend smarter, save more, and reach your goals faster.
          </p>
          <div className="space-y-4 w-full max-w-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Track Spending</p>
                <p className="text-xs text-muted-foreground">See where your money goes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Save Smarter</p>
                <p className="text-xs text-muted-foreground">Automated savings vaults</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Stay Secure</p>
                <p className="text-xs text-muted-foreground">Bank-level encryption</p>
              </div>
            </div>
          </div>
          <Button onClick={nextSlide} className="mt-8 w-full max-w-xs" size="lg">
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </SlideWrapper>
      ),
    },
    // Slide 1: Google OAuth
    {
      content: (
        <SlideWrapper direction={direction}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-3xl bg-white shadow-lg flex items-center justify-center mb-8"
          >
            <svg viewBox="0 0 24 24" className="w-10 h-10">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground text-center mb-4">
            Sign in with Google
          </h1>
          <p className="text-muted-foreground text-center max-w-sm mb-8">
            Securely sign in with your Google account. We'll never post anything without your permission.
          </p>
          <Button 
            onClick={handleGoogleSignIn} 
            disabled={isLoading}
            className="w-full max-w-xs bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm" 
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-6 max-w-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </SlideWrapper>
      ),
    },
    // Slide 2: Set Your Goals
    {
      content: (
        <SlideWrapper direction={direction}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-8"
          >
            <TrendingUp className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground text-center mb-4">
            What are your goals?
          </h1>
          <p className="text-muted-foreground text-center max-w-sm mb-8">
            Select what matters most to you. We'll personalize your experience.
          </p>
          <div className="space-y-3 w-full max-w-xs">
            {[
              { label: "Build an emergency fund", icon: "🛡️" },
              { label: "Pay off debt faster", icon: "💳" },
              { label: "Save for a big purchase", icon: "🏠" },
              { label: "Track daily spending", icon: "📊" },
              { label: "Invest for the future", icon: "📈" },
            ].map((goal, index) => (
              <motion.button
                key={goal.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left group"
              >
                <span className="text-xl">{goal.icon}</span>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {goal.label}
                </span>
                <div className="ml-auto w-5 h-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary transition-colors" />
              </motion.button>
            ))}
          </div>
          <Button onClick={nextSlide} className="mt-8 w-full max-w-xs" size="lg">
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </SlideWrapper>
      ),
    },
    // Slide 3: Connect Bank with Plaid
    {
      content: (
        <SlideWrapper direction={direction}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-8"
          >
            <Building2 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground text-center mb-4">
            Connect Your Bank
          </h1>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            Securely link your accounts with Plaid. Your credentials are never stored on our servers.
          </p>
          
          {connectedBanks.length > 0 ? (
            <div className="w-full max-w-xs space-y-3 mb-6">
              {connectedBanks.map((bank, index) => (
                <motion.div
                  key={bank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{bank}</p>
                    <p className="text-xs text-emerald-600">Connected</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="w-full max-w-xs space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <Shield className="w-5 h-5 text-emerald-500" />
                <p className="text-xs text-muted-foreground">256-bit encryption</p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <Shield className="w-5 h-5 text-blue-500" />
                <p className="text-xs text-muted-foreground">Read-only access</p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <Shield className="w-5 h-5 text-purple-500" />
                <p className="text-xs text-muted-foreground">Trusted by 12,000+ banks</p>
              </div>
            </div>
          )}

          <Button 
            onClick={connectedBanks.length > 0 ? nextSlide : handlePlaidConnect} 
            disabled={isLoading}
            className="w-full max-w-xs" 
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Connecting...
              </>
            ) : connectedBanks.length > 0 ? (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 mr-2" />
                Connect with Plaid
              </>
            )}
          </Button>
          
          {connectedBanks.length === 0 && (
            <button 
              onClick={nextSlide}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          )}
        </SlideWrapper>
      ),
    },
    // Slide 4: All Set
    {
      content: (
        <SlideWrapper direction={direction}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground text-center mb-4">
            You're all set!
          </h1>
          <p className="text-muted-foreground text-center max-w-sm mb-8">
            Your account is ready. Let's start your journey to financial freedom.
          </p>
          
          <div className="w-full max-w-xs space-y-3 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-muted/50"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Google account connected</p>
              </div>
            </motion.div>
            
            {connectedBanks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{connectedBanks.length} bank accounts linked</p>
                </div>
              </motion.div>
            )}
          </div>

          <Button onClick={handleComplete} className="w-full max-w-xs" size="lg">
            Go to Dashboard
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </SlideWrapper>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {currentSlide > 0 ? (
          <button
            onClick={prevSlide}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        ) : (
          <div className="w-9" />
        )}
        
        {/* Progress indicators */}
        <div className="flex gap-1.5">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-6 bg-primary' 
                  : index < currentSlide 
                    ? 'w-1.5 bg-primary/60' 
                    : 'w-1.5 bg-muted'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={() => navigate('/overview')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Slides */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <div key={currentSlide}>
            {slides[currentSlide].content}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
