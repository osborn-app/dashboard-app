"use client";

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ChevronRight, Minus } from 'lucide-react';
import { useGetPlanningAccounts } from '@/hooks/api/usePerencanaan';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DaftarAkunProps {
  planningId: string;
}

// Account interface based on API response
interface Account {
  id: number;
  created_at: string;
  updated_at: string;
  code: string;
  name: string;
  type: string;
  level: number;
  is_active: boolean;
  sort_order: number;
  is_header: boolean;
  is_connected_to_bank: boolean;
  bank_name?: string | null;
  bank_account_number?: string | null;
  initial_balance: number;
  parent_id?: string | null;
  description?: string | null;
  parent?: Account;
  children: Account[];
}

interface AccountItem extends Account {
  expanded: boolean;
  children: AccountItem[];
}

// Helper function to convert API response to Account format
const convertApiResponseToAccount = (apiItem: any): Account => {
              return {
    id: apiItem.id,
    created_at: apiItem.created_at,
    updated_at: apiItem.updated_at,
    code: apiItem.code,
    name: apiItem.name,
    type: apiItem.type,
    level: apiItem.level,
    is_active: apiItem.is_active,
    sort_order: apiItem.sort_order,
    is_header: apiItem.is_header,
    is_connected_to_bank: apiItem.is_connected_to_bank,
    bank_name: apiItem.bank_name,
    bank_account_number: apiItem.bank_account_number,
    initial_balance: apiItem.initial_balance,
    parent_id: apiItem.parent_id,
    description: apiItem.description,
    parent: apiItem.parent,
    children: apiItem.children || []
  };
};

// Helper function to organize accounts into hierarchical structure (same as realisasi)
const organizeAccountsHierarchy = (accounts: Account[]): AccountItem[] => {
  // Extract unique parent accounts from level 2 accounts
  // Memoize expensive calculations for better performance
  const { parentMap, rootAccounts, level2Accounts } = useMemo(() => {
    const parentMap = new Map<number, Account>();
    
    accounts.forEach(account => {
      if (account.level === 2 && account.parent) {
        // Store parent if not already stored
        if (!parentMap.has(account.parent.id)) {
          parentMap.set(account.parent.id, account.parent);
        }
      }
    });
    
    const rootAccounts = Array.from(parentMap.values());
    const level2Accounts = accounts.filter(account => account.level === 2);
    
    return { parentMap, rootAccounts, level2Accounts };
  }, [accounts]);
  
  // Build hierarchy manually since API doesn't provide nested structure
  const buildHierarchy = (rootAccount: Account): AccountItem => {
    // Find children for this root account
    const children = level2Accounts.filter(child => child.parent_id === rootAccount.id.toString());
    
    return {
      ...rootAccount,
      expanded: false,
      children: children.map(child => ({
        ...child,
        expanded: false,
        children: []
      }))
    };
  };
  
  // Process root accounts and their children
  const processedAccounts = rootAccounts.map(buildHierarchy);
  
  return processedAccounts;
};

// Account Item Component (same as realisasi)
function AccountItem({ 
  account, 
  level = 0, 
  onToggleExpansion
}: { 
  account: AccountItem; 
  level?: number;
  onToggleExpansion: (id: number) => void;
}) {
  const hasChildren = account.children && account.children.length > 0;
  const isExpanded = account.expanded;

  return (
    <div className="mb-2">
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
          "hover:bg-gray-50 cursor-pointer",
          level === 0 ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200",
          level === 1 ? "ml-6" : level === 2 ? "ml-12" : level === 3 ? "ml-18" : ""
        )}
      >
        <div className="flex items-center space-x-3">
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => onToggleExpansion(account.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <Minus className="h-4 w-4 text-blue-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs font-mono">
              {account.code}
            </Badge>
            <span className="font-medium text-gray-900">
              {account.name}
            </span>
            <span className="text-sm text-gray-500">
              ({account.type})
            </span>
          </div>
        </div>

      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-6">
          {account.children.map((child) => (
            <AccountItem
              key={child.id}
              account={child}
              level={level + 1}
              onToggleExpansion={onToggleExpansion}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Account List Component (same as realisasi)
function AccountList({ 
  accounts
}: {
  accounts: AccountItem[];
}) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpansion = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Update expanded state recursively
  const updateExpandedState = (account: AccountItem): AccountItem => {
    return {
      ...account,
      expanded: expandedItems.has(account.id),
      children: account.children.map(updateExpandedState)
    };
  };

  const accountsWithExpanded = accounts.map(updateExpandedState);

  return (
    <div className="space-y-2">
      {accountsWithExpanded.map(account => (
        <AccountItem
          key={account.id}
          account={account}
          onToggleExpansion={toggleExpansion}
        />
      ))}
    </div>
  );
}

export function DaftarAkun({ planningId }: DaftarAkunProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Build query parameters for API
  const queryParams = useMemo(() => ({
    ...(searchQuery ? { search: searchQuery } : {}),
    page: 1,
    limit: 1000 // Get all accounts
  }), [searchQuery]);

  // Use API hook
  const { data: accountsResponse, isLoading, error, refetch } = useGetPlanningAccounts(queryParams);

  // Convert API response to Account format and organize hierarchy
  const accountsData = useMemo(() => {
    if (!accountsResponse?.items) return [];
    
    const flatData = accountsResponse.items.map(convertApiResponseToAccount);
    return organizeAccountsHierarchy(flatData);
  }, [accountsResponse]);



  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accounts data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600">Error loading accounts data</p>
          <Button onClick={() => refetch()} className="mt-2">
            <Search className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Action Bar - KEEP SAME AS BEFORE */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari akun....."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button>
          <Search className="mr-2 h-4 w-4" />
          Rekap Akun
        </Button>
      </div>

      {/* Account List - SAME AS REALISASI */}
      <Card>
        <CardContent className="p-6">
          <AccountList
            accounts={accountsData}
          />
        </CardContent>
      </Card>
    </div>
  );
}