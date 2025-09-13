import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-skeleton-wave rounded-md bg-muted/50 relative overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

// Skeleton untuk Account List
export function AccountListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Account */}
      <div className="flex items-center space-x-4 p-4 border rounded-lg animate-stagger-fade-in stagger-1">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      {/* Detail Accounts */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className={`flex items-center space-x-4 p-4 border rounded-lg ml-8 animate-stagger-fade-in stagger-${i + 2}`}>
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
      
      {/* Another Header Account */}
      <div className="flex items-center space-x-4 p-4 border rounded-lg animate-stagger-fade-in stagger-5">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-18" />
        <Skeleton className="h-4 w-14" />
      </div>
      
      {/* Detail Accounts */}
      {[...Array(2)].map((_, i) => (
        <div key={i} className={`flex items-center space-x-4 p-4 border rounded-lg ml-8 animate-stagger-fade-in stagger-${i + 6}`}>
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-22" />
          <Skeleton className="h-4 w-18" />
        </div>
      ))}
    </div>
  );
}

// Skeleton untuk Account Table
export function AccountTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center animate-stagger-fade-in stagger-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="border rounded-lg animate-stagger-fade-in stagger-2">
        <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted/30">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`grid grid-cols-5 gap-4 p-4 border-b animate-stagger-fade-in stagger-${i + 3}`}>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton untuk Categories
export function CategoriesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center animate-stagger-fade-in stagger-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="border rounded-lg animate-stagger-fade-in stagger-2">
        <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/30">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`grid grid-cols-4 gap-4 p-4 border-b animate-stagger-fade-in stagger-${i + 3}`}>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton untuk Transactions Table
export function TransactionsSkeleton() {
  return (
    <div className="border rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-300">
              <th className="border-r border-gray-300 p-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="border-r border-gray-300 p-3 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="border-r border-gray-300 p-3 text-left">
                <Skeleton className="h-4 w-32" />
              </th>
              <th className="border-r border-gray-300 p-3 text-left">
                <Skeleton className="h-4 w-28" />
              </th>
              <th className="border-r border-gray-300 p-3 text-right">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="border-r border-gray-300 p-3 text-right">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="p-3 text-center">
                <Skeleton className="h-4 w-16" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="border-r border-gray-300 p-3">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="border-r border-gray-300 p-3">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="border-r border-gray-300 p-3">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="border-r border-gray-300 p-3">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="border-r border-gray-300 p-3 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </td>
                <td className="border-r border-gray-300 p-3 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </td>
                <td className="p-3 text-center">
                  <Skeleton className="h-8 w-8 mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Skeleton untuk Reports
export function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-stagger-fade-in stagger-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`p-6 border rounded-lg animate-stagger-fade-in stagger-${i + 2}`}>
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      
      {/* Report Table */}
      <div className="border rounded-lg animate-stagger-fade-in stagger-5">
        <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/30">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`grid grid-cols-4 gap-4 p-4 border-b animate-stagger-fade-in stagger-${i + 6}`}>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading Spinner Component
export function LoadingSpinner({ size = "default", className }: { size?: "sm" | "default" | "lg", className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("animate-spin rounded-full border-2 border-muted border-t-primary", sizeClasses[size], className)} />
  );
}

// Fade In Animation Wrapper
export function FadeInWrapper({ children, delay = 0, className }: { 
  children: React.ReactNode, 
  delay?: number, 
  className?: string 
}) {
  return (
    <div 
      className={cn(
        "animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Loading Button Component
export function LoadingButton({ 
  children, 
  loading, 
  loadingText = "Loading...", 
  className,
  ...props 
}: { 
  children: React.ReactNode, 
  loading: boolean, 
  loadingText?: string,
  className?: string 
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center transition-all duration-200",
        loading && "opacity-70 cursor-not-allowed",
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Pulse Animation for Cards
export function PulseCard({ children, className }: { 
  children: React.ReactNode, 
  className?: string 
}) {
  return (
    <div 
      className={cn(
        "animate-pulse bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20 bg-[length:200%_100%]",
        className
      )}
      style={{ 
        animation: "pulse 2s ease-in-out infinite, shimmer 2s ease-in-out infinite" 
      }}
    >
      {children}
    </div>
  );
}

// Shimmer Effect
export function ShimmerEffect({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent",
        className
      )}
    />
  );
}
