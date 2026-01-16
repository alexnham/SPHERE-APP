import { 
  Tv, 
  Zap, 
  Dumbbell, 
  Smartphone, 
  Utensils, 
  Car, 
  FileText,
  type LucideIcon 
} from 'lucide-react-native';

export const categoryIconMap: Record<string, LucideIcon> = {
  Entertainment: Tv,
  Utilities: Zap,
  Health: Dumbbell,
  Tech: Smartphone,
  Food: Utensils,
  Transport: Car,
};

export const DefaultCategoryIcon = FileText;

// Legacy function for backwards compatibility - returns icon name
export const getCategoryIconName = (category: string): string => {
  const map: Record<string, string> = {
    Entertainment: 'tv',
    Utilities: 'zap',
    Health: 'dumbbell',
    Tech: 'smartphone',
    Food: 'utensils',
    Transport: 'car',
  };
  return map[category] || 'file-text';
};