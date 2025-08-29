// src/components/common/LoadingSpinner.tsx
import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface LoadingSpinnerProps {
 size?: 'sm' | 'md' | 'lg' | 'xl';
 className?: string;
 color?: string;
 text?: string;
}

const sizeClasses = {
 sm: 'w-4 h-4',
 md: 'w-6 h-6', 
 lg: 'w-8 h-8',
 xl: 'w-12 h-12'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
 size = 'md', 
 className = '', 
 color,
 text 
}) => {
 const { theme } = useTheme();
 const spinnerColor = color || theme.colors.primary[500];
 
 return (
   <div className={\lex flex-col items-center justify-center space-y-2 \\}>
     <div
       className={\nimate-spin rounded-full border-2 border-transparent \\}
       style={{
         borderTopColor: spinnerColor,
         borderRightColor: spinnerColor
       }}
     />
     {text && (
       <p className=\"text-sm animate-pulse\"
          style={{ color: theme.colors.text.secondary }}>
         {text}
       </p>
     )}
   </div>
 );
};

// Specialized loading components
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'A carregar...' }) => (
 <div className=\"min-h-screen flex items-center justify-center\">
   <LoadingSpinner size=\"lg\" text={text} />
 </div>
);

export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => (
 <div className=\"flex items-center justify-center py-8\">
   <LoadingSpinner size=\"md\" text={text} />
 </div>
);

export const ButtonLoader: React.FC = () => (
 <LoadingSpinner size=\"sm\" color=\"white\" />
);
