"use client";

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useGetPlanningCategoryAccounts } from '@/hooks/api/usePerencanaan';

// ===== ARUS KAS CATEGORY ACCOUNTS =====
interface ArusKasCategoryAccountsProps {
  categoryId: string;
  planningId: string | number;
  onAddAccount: () => void;
  onDeleteAccount: (accountId: string) => void;
}

export const ArusKasCategoryAccounts = ({ 
  categoryId, 
  planningId,
  onAddAccount, 
  onDeleteAccount 
}: ArusKasCategoryAccountsProps) => {
  // Fetch accounts data from API
  const { data: accountsData, isLoading, error } = useGetPlanningCategoryAccounts(planningId, categoryId);

  // Extract accounts from API response
  const accounts = Array.isArray(accountsData) ? accountsData : accountsData?.items || accountsData?.data || [];

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-sm text-red-500">Error loading accounts</p>
      </div>
    );
  }

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
          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
          <div className="text-blue-500 font-medium text-sm">+ TAMBAH</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Account Items */}
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
             <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700" onClick={() => onDeleteAccount(account.id)}>
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
        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
        <div className="text-blue-500 font-medium text-sm">+ TAMBAH</div>
      </div>
    </div>
  );
};

// ===== CATEGORY ACCOUNTS =====
interface CategoryAccountsProps {
  categoryId: string;
  planningId: string | number;
  onAddAccount?: () => void;
  onDeleteAccount?: (accountId: string) => void;
}

export const CategoryAccounts = ({ 
  categoryId, 
  planningId,
  onAddAccount, 
  onDeleteAccount 
}: CategoryAccountsProps) => {
  const { data: accountsData, isLoading, error } = useGetPlanningCategoryAccounts(planningId, categoryId);
  
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

// ===== LABA RUGI CATEGORY ACCOUNTS =====
interface LabaRugiCategoryAccountsProps {
  category: {
    id: string;
    name: string;
    type: string;
    entry_count: number;
    account_count: number;
  };
  planningId: string | number;
  onAddAccount: (categoryId: string, categoryType?: 'PENDAPATAN' | 'BEBAN') => void;
  onDeleteAccount: (accountId: string) => void;
}

export function LabaRugiCategoryAccounts({ 
  category, 
  planningId,
  onAddAccount, 
  onDeleteAccount 
}: LabaRugiCategoryAccountsProps) {
  // Get accounts untuk kategori ini
  const { data: accountsData, isLoading } = useGetPlanningCategoryAccounts(planningId, category.id);

  // Handle different data structures
  const accounts = Array.isArray(accountsData) ? accountsData : accountsData?.data || accountsData?.items || [];

  return (
    <div className="space-y-4">
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
              onClick={() => onAddAccount(category.id, category.type as 'PENDAPATAN' | 'BEBAN')}
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
              onClick={() => onAddAccount(category.id, category.type as 'PENDAPATAN' | 'BEBAN')}
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
