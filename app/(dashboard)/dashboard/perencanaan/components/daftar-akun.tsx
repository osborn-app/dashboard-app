"use client";

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MoreHorizontal, Eye, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { dummyAkunData } from '../data/dummy-data';
import { AkunTable } from '@/components/tables/akun-tables/akun-table';
import { createAkunColumns, AkunItem } from '@/components/tables/akun-tables/columns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DaftarAkunProps {
  planningId: string;
}

export function DaftarAkun({ planningId }: DaftarAkunProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['1', '2', '5', '8', '9', '11', '12']));


  // Filter and flatten data with expand/collapse logic
  const filteredData = useMemo(() => {
    let data = dummyAkunData;
    
    if (searchQuery) {
      const filterRecursive = (items: any[]): any[] => {
        return items.filter(item => {
          const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.code.includes(searchQuery);
          
          if (item.children) {
            const filteredChildren = filterRecursive(item.children);
            if (filteredChildren.length > 0) {
              return {
                ...item,
                children: filteredChildren
              };
            }
          }
          
          return matchesSearch;
        }).map(item => ({
          ...item,
          children: item.children ? filterRecursive(item.children) : undefined
        }));
      };
      
      data = filterRecursive(dummyAkunData);
    }
    
    // Flatten data with expand/collapse logic
    const flattenWithExpand = (items: any[], level = 0): any[] => {
      const result: any[] = [];
      
      items.forEach(item => {
        const flattenedItem = {
          ...item,
          level,
          hasChildren: item.children && item.children.length > 0
        };
        result.push(flattenedItem);
        
        // If item has children and is expanded, add children
        if (item.children && item.children.length > 0 && expandedItems.has(item.id)) {
          const children = flattenWithExpand(item.children, level + 1);
          result.push(...children);
        }
      });
      
      return result;
    };
    
    return flattenWithExpand(data);
  }, [searchQuery, expandedItems]);

  const toggleExpanded = (id: string) => {
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

  const handleEdit = (item: AkunItem) => {
    console.log('Edit akun:', item);
  };

  const handleDelete = (item: AkunItem) => {
    console.log('Delete akun:', item);
  };

  const handleView = (item: AkunItem) => {
    console.log('View akun:', item);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
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

      {/* Account List */}
      <div className="space-y-2">
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="border border-blue-200 rounded-lg p-4 bg-white hover:bg-blue-50 transition-colors"
            style={{ marginLeft: `${(item.level ?? 0) * 20}px` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Expand/Collapse Button */}
                {item.hasChildren ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    {expandedItems.has(item.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <div className="w-6 h-6"></div> // Spacer for alignment
                )}
                
                <span className="text-blue-600 font-semibold text-sm">
                  - {item.code} - {item.name}
                </span>
              </div>
              
              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleView(item)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(item)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDelete(item)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
