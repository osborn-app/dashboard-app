"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdvancedPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
  showInfo?: boolean
  className?: string
  maxVisiblePages?: number
}

export function AdvancedPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showInfo = true,
  className,
  maxVisiblePages = 5,
}: AdvancedPaginationProps) {
  const [pageSize, setPageSize] = React.useState(itemsPerPage)

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages: (number | string)[] = []
    const halfVisible = Math.floor(maxVisiblePages / 2)
    
    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)
    
    // Adjust if we're near the beginning or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages)
    }
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1)
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) {
        pages.push('...')
      }
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }
    
    return pages
  }

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize)
    setPageSize(size)
    onPageSizeChange?.(size)
    // Reset to first page when changing page size
    onPageChange(1)
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {/* Info Section */}
      {showInfo && (
        <div className="text-sm text-gray-600">
          Menampilkan {startItem} - {endItem} dari {totalItems} data
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Page Size Selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Per halaman:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Pagination Buttons */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page Numbers */}
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="flex h-8 w-8 items-center justify-center text-sm text-gray-500">
                  ...
                </span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}

          {/* Next Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Simple Pagination Component
interface SimplePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  maxVisiblePages?: number
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  maxVisiblePages = 5,
}: SimplePaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | string)[] = []
    const halfVisible = Math.floor(maxVisiblePages / 2)
    
    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)
    
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages)
    }
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1)
    }
    
    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) {
        pages.push('...')
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }
    
    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers */}
      {getVisiblePages().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="flex h-8 w-8 items-center justify-center text-sm text-gray-500">
              ...
            </span>
          ) : (
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
