'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Badge, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StatusBadge = ({ status }) => {
  const safeStatus = (status || 'pending').toLowerCase();
  
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    missing : 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[safeStatus]}`}>
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  );
};

export function CompletedUploadsDashboard() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchCompletedLoans = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/loans');
        if (!response.ok) {
          throw new Error('Failed to fetch loan data');
        }
        const data = await response.json();
        setLoans(data);
      } catch (error) {
        console.error("Error fetching completed loans:", error);
        toast.error("Could not load completed loan data.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedLoans();
  }, []);
  
  const filteredLoans = useMemo(() => {
    if (!searchTerm) {
      return loans;
    }
    return loans.filter(loan =>
      loan.loan_account_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [loans, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  
  const currentLoans = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLoans.slice(startIndex, endIndex);
  }, [filteredLoans, currentPage, itemsPerPage]);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  if (loading) {
    return <div className="text-center p-10 text-gray-500">Loading All loan data...</div>;
  }
  
  if (loans.length === 0 && !searchTerm) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Completed Loans</h2>
        <p className="text-gray-500">No loans with 'Upload Completed' status found.</p>
      </div>
    );    
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 underline">All Loans Applications</h2>
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Account No.</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MODT Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOI Index 2 Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MODT Document</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOI Index 2 Document</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentLoans.map((loan) => (
              <tr key={loan.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.loan_account_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <StatusBadge status={loan.modt_approval_status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <StatusBadge status={loan.noi_index2_approval_status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {loan.modt ? (
                     <a href={loan.modt} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 hover:underline">View MODT</a>
                  ) : (
                    <StatusBadge status="missing" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   {loan.noi_index2 ? (
                     <a href={loan.noi_index2} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 hover:underline">View NOI Index 2</a>
                  ) : (
                    <StatusBadge status="missing" />
                  )}
                </td>
              </tr>
            ))}
             {filteredLoans.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  No matching loans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className="flex justify-center  items-center mt-4">
          <span className="text-sm text-gray-700 pr-7">
            Page {currentPage} of {totalPages}
          </span>
          <div className="inline-flex -space-x-px ">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              variant="outline"
              className="rounded-r-none"
            >
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              variant="outline"
              className="rounded-l-none"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}