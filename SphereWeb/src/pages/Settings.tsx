import { motion } from "framer-motion";
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Smartphone, 
  Link2, 
  HelpCircle,
  ChevronRight,
  Building,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

// Mock user data (pretending logged in)
const mockUser = {
  name: "Alex Johnson",
  email: "alex.johnson@gmail.com",
  avatar: null,
  phone: "+1 (555) 123-4567",
  memberSince: "January 2024"
};

const mockConnectedBanks = [
  { name: "Chase Bank", accounts: 3, lastSync: "2 hours ago" },
  { name: "Bank of America", accounts: 2, lastSync: "1 day ago" }
];

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);

  const initials = mockUser.name.split(" ").map(n => n[0]).join("");

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Personal Information",
          description: "Name, email, phone number",
          onClick: () => {}
        },
        {
          icon: Shield,
          label: "Security",
          description: "Password, 2FA, login history",
          onClick: () => {}
        },
        {
          icon: Smartphone,
          label: "Devices",
          description: "Manage connected devices",
          onClick: () => {}
        }
      ]
    },
    {
      title: "Linked Accounts",
      items: [
        {
          icon: Building,
          label: "Connected Banks",
          description: `${mockConnectedBanks.length} banks connected`,
          onClick: () => {}
        },
        {
          icon: Link2,
          label: "Add New Account",
          description: "Connect another bank or card",
          onClick: () => navigate('/onboarding')
        }
      ]
    },
    {
      title: "Preferences",
      items: [
        {
          icon: CreditCard,
          label: "Payment Methods",
          description: "Manage your payment options",
          onClick: () => {}
        },
        {
          icon: Bell,
          label: "Notifications",
          description: "Alerts, reminders, updates",
          onClick: () => {}
        }
      ]
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help Center",
          description: "FAQs and support articles",
          onClick: () => {}
        }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6 pb-8"
    >
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-6 border border-border/50"
      >
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 ring-4 ring-primary/20">
            <AvatarImage src={mockUser.avatar || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{mockUser.name}</h2>
            <p className="text-sm text-muted-foreground">{mockUser.email}</p>
            <p className="text-xs text-muted-foreground mt-1">Member since {mockUser.memberSince}</p>
          </div>
          <button className="text-sm text-primary font-medium hover:underline">
            Edit
          </button>
        </div>
      </motion.div>

      {/* Connected Banks Quick View */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl p-4 border border-border/50"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Connected Banks</h3>
        <div className="space-y-3">
          {mockConnectedBanks.map((bank, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Building className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{bank.name}</p>
                  <p className="text-xs text-muted-foreground">{bank.accounts} accounts • Synced {bank.lastSync}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Toggles */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-4 border border-border/50 space-y-4"
      >
        <h3 className="text-sm font-medium text-muted-foreground">Quick Settings</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
            <div>
              <p className="text-sm font-medium text-foreground">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
            </div>
          </div>
          <Switch 
            checked={theme === 'dark'} 
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Push Notifications</p>
              <p className="text-xs text-muted-foreground">Receive alerts on your device</p>
            </div>
          </div>
          <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Weekly summaries and alerts</p>
            </div>
          </div>
          <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Biometric Authentication</p>
              <p className="text-xs text-muted-foreground">Use Face ID or fingerprint</p>
            </div>
          </div>
          <Switch checked={biometricAuth} onCheckedChange={setBiometricAuth} />
        </div>
      </motion.div>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIdx) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 + sectionIdx * 0.05 }}
          className="bg-card rounded-2xl border border-border/50 overflow-hidden"
        >
          <h3 className="text-sm font-medium text-muted-foreground px-4 pt-4 pb-2">{section.title}</h3>
          {section.items.map((item, itemIdx) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </motion.div>
      ))}

      {/* Sign Out Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/auth')}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sign Out</span>
      </motion.button>

      {/* App Version */}
      <p className="text-center text-xs text-muted-foreground">
        Sphere v1.0.0 • Made with ❤️
      </p>
    </motion.div>
  );
}
