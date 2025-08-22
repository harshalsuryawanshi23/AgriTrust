'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <motion.div
      className={cn(
        'inline-block rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = 'Loading...' }: LoadingScreenProps) => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <LoadingSpinner size="lg" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}

const LoadingOverlay = ({ isLoading, children, message }: LoadingOverlayProps) => (
  <div className="relative">
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-md">
        <div className="flex flex-col items-center space-y-2">
          <LoadingSpinner />
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
      </div>
    )}
  </div>
);

export { LoadingSpinner, LoadingScreen, LoadingOverlay };
