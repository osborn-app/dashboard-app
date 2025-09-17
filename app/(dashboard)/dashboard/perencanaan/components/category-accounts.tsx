"use client";

import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useGetPlanningCategoryAccounts } from '@/hooks/api/usePerencanaan';

interface CategoryAccountsProps {
  categoryId: string;
  onAddAccount?: () => void;
  onEditAccount?: (accountId: string) => void;
  onDeleteAccount?: (accountId: string) => void;
}

export const CategoryAccounts = ({ 
  categoryId, 
  onAddAccount, 
  onEditAccount, 
  onDeleteAccount 
}: CategoryAccountsProps) => {
  const { data: accountsData, isLoading, error } = useGetPlanningCategoryAccounts(categoryId);
  
  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-3 text-center">
        <p className="text-sm text-red-500">Error loading accounts</p>
      </div>
    );
  }

  const accounts = Array.isArray(accountsData) ? accountsData : accountsData?.data || [];

  if (accounts.length === 0) {
    return (
      <div className="space-y-2">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-500">Tidak ada akun</p>
        </div>
        
        {/* Add Account Button */}
        <div 
          onClick={onAddAccount}
          className="bg-gray-50 rounded-lg p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="w-1 h-6 bg-green-500 rounded-full"></div>
          <div className="text-green-500 font-medium text-sm">+ TAMBAH</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {accounts.map((account: any) => (
        <div key={account.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-6 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-700">{account.name}</p>
              {account.code && (
                <p className="text-xs text-gray-500">{account.code}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => onEditAccount?.(account.id)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              onClick={() => onDeleteAccount?.(account.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
      
      {/* Add Account Button */}
      <div 
        onClick={onAddAccount}
        className="bg-gray-50 rounded-lg p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div className="w-1 h-6 bg-green-500 rounded-full"></div>
        <div className="text-green-500 font-medium text-sm">+ TAMBAH</div>
      </div>
    </div>
  );
};
