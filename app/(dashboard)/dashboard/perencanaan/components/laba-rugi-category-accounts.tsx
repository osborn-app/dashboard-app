"use client";

import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useGetPlanningCategoryAccounts } from '@/hooks/api/usePerencanaan';

interface LabaRugiCategoryAccountsProps {
  category: {
    id: string;
    name: string;
    type: string;
    entry_count: number;
    account_count: number;
  };
  onAddAccount: (categoryId: string) => void;
  onEditAccount: (accountId: string) => void;
  onDeleteAccount: (accountId: string) => void;
}

export function LabaRugiCategoryAccounts({ 
  category, 
  onAddAccount, 
  onEditAccount, 
  onDeleteAccount 
}: LabaRugiCategoryAccountsProps) {
  // Get accounts untuk kategori ini
  const { data: accountsData, isLoading } = useGetPlanningCategoryAccounts(category.id);

  // Handle different data structures
  const accounts = Array.isArray(accountsData) ? accountsData : accountsData?.data || accountsData?.items || [];
  
  // Debug log
  console.log('LabaRugiCategoryAccounts - category:', category.name, 'accountsData:', accountsData, 'accounts:', accounts);

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-500">
            {category.account_count} akun • {category.entry_count} entri
          </p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : accounts.length > 0 ? (
          <>
            {accounts.map((account: any) => (
              <div key={account.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
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
                    onClick={() => onEditAccount(account.id)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    onClick={() => onDeleteAccount(account.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Add Account Button - sama seperti Neraca */}
            <div 
              onClick={() => onAddAccount(category.id)}
              className="bg-gray-50 rounded-lg p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <div className="text-green-500 font-medium text-sm">+ TAMBAH</div>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500">Tidak ada akun</p>
            </div>
            
            {/* Add Account Button - sama seperti Neraca */}
            <div 
              onClick={() => onAddAccount(category.id)}
              className="bg-gray-50 rounded-lg p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <div className="text-green-500 font-medium text-sm">+ TAMBAH</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
