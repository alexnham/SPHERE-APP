import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Receipt, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: ArrowDownLeft, label: "Income", color: "bg-green-500" },
    { icon: ArrowUpRight, label: "Expense", color: "bg-red-500" },
    { icon: Receipt, label: "Transfer", color: "bg-blue-500" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-center gap-3">
      <AnimatePresence>
        {isOpen && (
          <>
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button
                  size="lg"
                  className={`${item.color} hover:opacity-90 rounded-full h-12 w-12 shadow-lg`}
                  onClick={() => {
                    console.log(`Add ${item.label}`);
                    setIsOpen(false);
                  }}
                >
                  <item.icon className="h-5 w-5 text-white" />
                  <span className="sr-only">{item.label}</span>
                </Button>
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute right-16 top-1/2 -translate-y-1/2 bg-card text-card-foreground px-3 py-1.5 rounded-lg text-sm font-medium shadow-md whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          size="lg"
          className="rounded-full h-14 w-14 bg-primary hover:bg-primary/90 shadow-xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </motion.div>
        </Button>
      </motion.div>
    </div>
  );
};
