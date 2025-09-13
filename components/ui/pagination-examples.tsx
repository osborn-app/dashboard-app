"use client"

import * as React from "react"
import { AdvancedPagination, SimplePagination } from "@/components/ui/advanced-pagination"

// Example 1: Basic Usage
export function BasicPaginationExample() {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  
  const totalItems = 150
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Pagination</h3>
      <AdvancedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setItemsPerPage}
        pageSizeOptions={[5, 10, 20, 50]}
        showPageSizeSelector={true}
        showInfo={true}
      />
    </div>
  )
}

// Example 2: Simple Pagination (No Page Size Selector)
export function SimplePaginationExample() {
  const [currentPage, setCurrentPage] = React.useState(1)
  
  const totalPages = 10

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Simple Pagination</h3>
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        maxVisiblePages={3}
      />
    </div>
  )
}

// Example 3: Custom Styling
export function CustomStyledPaginationExample() {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(20)
  
  const totalItems = 500
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Custom Styled Pagination</h3>
      <AdvancedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setItemsPerPage}
        pageSizeOptions={[10, 20, 50, 100]}
        showPageSizeSelector={true}
        showInfo={true}
        className="bg-gray-50 p-4 rounded-lg border"
        maxVisiblePages={7}
      />
    </div>
  )
}

// Example 4: Minimal Pagination (Only Info)
export function MinimalPaginationExample() {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(25)
  
  const totalItems = 75
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Minimal Pagination</h3>
      <AdvancedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setItemsPerPage}
        pageSizeOptions={[10, 25, 50]}
        showPageSizeSelector={false}
        showInfo={true}
        maxVisiblePages={3}
      />
    </div>
  )
}

// Example 5: Large Dataset Pagination
export function LargeDatasetPaginationExample() {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(100)
  
  const totalItems = 10000
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Large Dataset Pagination</h3>
      <AdvancedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setItemsPerPage}
        pageSizeOptions={[50, 100, 200, 500]}
        showPageSizeSelector={true}
        showInfo={true}
        maxVisiblePages={5}
      />
    </div>
  )
}

// Example 6: All Examples Together
export function AllPaginationExamples() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Pagination Examples</h2>
      
      <BasicPaginationExample />
      <SimplePaginationExample />
      <CustomStyledPaginationExample />
      <MinimalPaginationExample />
      <LargeDatasetPaginationExample />
    </div>
  )
}
