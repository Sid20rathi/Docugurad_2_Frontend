'use client';

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'destructive';
    case 'upload completed':
      return 'success';
    default:
      return 'secondary';
  }
};

const ViewFileLink = ({ filePath, label = "View File" }) => {
  if (!filePath) {
    return <Badge variant="destructive">Missing</Badge>;
  }
  const fileUrl = `${filePath}`;
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      {label}
    </a>
  );
};

const getApprovalStatus = (loan) => {
  if (loan.modt_approval_status === 'approved' && loan.noi_index2_approval_status === 'approved') {
    return 'APPROVED';
  } else if (loan.modt_approval_status === 'rejected' && loan.noi_index2_approval_status === 'rejected') {
    return 'REJECTED';
  } else if (loan.modt_approval_status === 'approved' && loan.noi_index2_approval_status === 'rejected') {
    return 'MODT Approved';
  } else if (loan.modt_approval_status === 'rejected' && loan.noi_index2_approval_status === 'approved') {
    return 'NOI Index2 Approved';
  }
  return 'PENDING';
};

const getApprovalStatusVariant = (status) => {
  switch (status) {
    case 'APPROVED':
      return'success';
    case 'MODT Approved':
      return 'MODT_Approved';
    case 'NOI Index2 Approved':
      return 'NOI_Index2_Approved';
    case 'REJECTED':
      return 'REJECTED';
    case 'PENDING':
      return 'PENDING';
    default:
      return 'PENDING';
  }
};

export function AllLoansDashboard() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchAllLoans = async () => {
      const userEmail = localStorage.getItem("user_email");
      if (!userEmail) {
        setError("User email not found. Please sign in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/api/loans?email=${userEmail}`);
        setLoans(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch loans:", err);
        setError("Could not load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllLoans();
  }, []);

  const filteredLoans = useMemo(() => {
    if (!searchTerm) {
      return loans;
    }
    return loans.filter(loan =>
      loan.loan_account_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [loans, searchTerm]);

  const paginatedLoans = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLoans.slice(startIndex, endIndex);
  }, [filteredLoans, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleRowClick = (loan) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="rounded-md border p-4">
        <h2 className="text-2xl font-bold mb-4">Loading All Loan Files...</h2>
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border bg-red-50 p-4 text-red-700">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="text-3xl font-bold mb-7 flex justify-center">MY DASHBOARD</div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by Loan Account Number..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-sm pl-10"
        />
      </div>

      <div className="rounded-md border shadow-xl w-full">
        <h2 className="text-2xl font-bold p-4 underline">All Loan Applications</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan Account No.</TableHead>
              <TableHead>Upload Status</TableHead>
              <TableHead>MODT</TableHead>
              <TableHead>MODT Status</TableHead>
              <TableHead>NOI Data Entry</TableHead>
              <TableHead>NOI Receipt</TableHead>
              <TableHead>NOI Index2</TableHead>
              <TableHead>NOI Index2 Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Approval Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLoans.length > 0 ? (
              paginatedLoans.map((loan) => {
                const approvalStatus = getApprovalStatus(loan);
                return (
                  <TableRow
                    key={loan.id}
                    onClick={() => handleRowClick(loan)}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="font-bold">{loan.loan_account_number}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(loan.status)}>
                        {loan.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell><ViewFileLink filePath={loan.modt} /></TableCell>
                    <TableCell>
                      <Badge variant={loan.modt_approval_status.toUpperCase()}>
                        {loan.modt_approval_status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell><ViewFileLink filePath={loan.noi_data_entry_page} /></TableCell>
                    <TableCell><ViewFileLink filePath={loan.noi_receipt} /></TableCell>
                    <TableCell><ViewFileLink filePath={loan.noi_index2} /></TableCell>
                    <TableCell>
                      <Badge variant={loan.noi_index2_approval_status.toUpperCase()}>
                        {loan.noi_index2_approval_status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(loan.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getApprovalStatusVariant(approvalStatus)}>
                        {approvalStatus.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center h-24">
                  No loan applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-center mt-4 space-x-2 py-4 px-4 border-t">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages > 0 ? totalPages : 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Status for: {selectedLoan?.loan_account_number}</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                <p className="font-bold text-lg">Overall Approval Status</p>
                <Badge variant={getApprovalStatusVariant(getApprovalStatus(selectedLoan))} className="text-lg">
                  {getApprovalStatus(selectedLoan).toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md">
                <p className="font-semibold">MODT Document</p>
                <ViewFileLink filePath={selectedLoan.modt} label="View File" />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                <p className="font-semibold text-lg">MODT Approval Status</p>
                <Badge variant={selectedLoan.modt_approval_status.toUpperCase()} className="text-lg">
                  {selectedLoan.modt_approval_status.toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md">
                <p className="font-semibold">NOI Data Entry Page</p>
                <ViewFileLink filePath={selectedLoan.noi_data_entry_page} label="View File" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md">
                <p className="font-semibold">NOI Receipt</p>
                <ViewFileLink filePath={selectedLoan.noi_receipt} label="View File" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md">
                <p className="font-semibold">NOI Index2</p>
                <ViewFileLink filePath={selectedLoan.noi_index2} label="View File" />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                <p className="font-semibold text-lg">NOI Index2 Approval Status</p>
                <Badge variant={selectedLoan.noi_index2_approval_status.toUpperCase()} className="text-lg">
                  {selectedLoan.noi_index2_approval_status.toUpperCase()}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
