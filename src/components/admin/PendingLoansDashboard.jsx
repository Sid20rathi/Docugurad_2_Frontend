'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ViewFileLink = ({ filePath, label }) => {
  if (!filePath) {
    return <Badge variant="destructive">Missing</Badge>;
  }
  return (
    <a
      href={filePath}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {label}
    </a>
  );
};

export function PendingLoansDashboard() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const fetchPendingLoans = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/loans/pending-approval');
      setLoans(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch loans. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  const filteredLoans = useMemo(() => {
    if (!searchTerm) {
      return loans;
    }
    return loans.filter(loan =>
      loan.loan_account_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [loans, searchTerm]);

  const handleVerificationRedirect = (loanId, loanAccountNumber, fileType, filePath) => {
    if (!filePath) {
      toast.error('File is not uploaded yet. Please upload the file first.');
      return;
    }
    const pathname = `/verification/dashboard/${loanId}`;
    const queryParams = new URLSearchParams({
      loanAccountNumber,
      fileType,
      filePath: encodeURIComponent(filePath),
    });
    router.push(`${pathname}?${queryParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="space-y-3 mt-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center mt-6">{error}</p>;
  }

  return (
    <div className="rounded-md border shadow-lg mt-6">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold underline">Pending Loan Approvals</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Loan Account No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm pl-10"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loan Account No.</TableHead>
            <TableHead>MODT Document</TableHead>
            <TableHead>NOI Index II </TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLoans.length > 0 ? (
            filteredLoans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">{loan.loan_account_number}</TableCell>
                <TableCell>
                  <ViewFileLink filePath={loan.modt} label="View MODT" />
                </TableCell>
                <TableCell>
                  <ViewFileLink filePath={loan.noi_index2} label="View NOI Index II" />
                </TableCell>
                <TableCell className="space-y-2">
                  {loan.modt_approval_status === 'pending' && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm">MODT:</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          className="bg-yellow-100 text-yellow-800 cursor-pointer"
                          onClick={() => handleVerificationRedirect(loan.id, loan.loan_account_number, 'MODT', loan.modt)}
                        >
                          Pending
                        </Button>
                      </div>
                    </div>
                  )}
                  {loan.noi_index2_approval_status === 'pending' &&  (
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm">NOI Index II :</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          className="bg-yellow-100 text-yellow-800 cursor-pointer"
                          onClick={() => handleVerificationRedirect(loan.id, loan.loan_account_number, 'NOI INDEX II', loan.noi_index2)}
                        >
                          Pending
                        </Button>
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                No loans are currently pending approval.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
