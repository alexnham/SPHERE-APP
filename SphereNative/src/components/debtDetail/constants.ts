export const getIcon = (type: string): string => {
  switch (type) {
    case 'credit_card': return '💳';
    case 'auto_loan': return '🚗';
    case 'student_loan': return '🎓';
    case 'mortgage': return '🏠';
    case 'personal_loan': return '💰';
    default: return '💳';
  }
};

export const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'credit_card': return 'Credit Card';
    case 'auto_loan': return 'Auto Loan';
    case 'student_loan': return 'Student Loan';
    case 'mortgage': return 'Mortgage';
    case 'personal_loan': return 'Personal Loan';
    case 'bnpl': return 'Buy Now Pay Later';
    default: return 'Debt';
  }
};