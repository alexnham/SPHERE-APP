export const getCategoryIcon = (category: string): string => {
  const map: Record<string, string> = {
    Entertainment: '📺',
    Utilities: '⚡',
    Health: '💪',
    Tech: '📱',
    Food: '🍽️',
    Transport: '🚗',
  };
  return map[category] || '📄';
};