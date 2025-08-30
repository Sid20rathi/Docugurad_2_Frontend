// File: app/manager/page.js (or your component's file path)
'use client';

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { LogOut, Search, ExternalLink, FileText, Info, CheckCircle, XCircle, Clock, Upload } from 'lucide-react';


import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
} from "@/components/ui/resizable-navbar";

// A new component for the statistics cards
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default function Managerpages() {

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;


  const profileRef = useRef(null);
  const router = useRouter();


  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    const storedUserType = localStorage.getItem("user_type");
    const storedUserName = localStorage.getItem("user_name");

    if (!storedEmail || storedUserType !== 'manager') {
      toast.error("Access Denied. Please sign in as a manager.");
      router.push("/signin");
      return;
    }

    setUserName(storedUserName || "Manager");
    setEmail(storedEmail);

    const fetchLoans = async () => {
      setLoading(true);
      try {
      
        const response = await fetch('/api/loans/bank_data');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch loan data.');
        }
        const data = await response.json();
        setLoans(data);
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error(`Could not load loan data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoans();

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [router]);


  const filteredLoans = useMemo(() => {
    if (!searchTerm) {
      return loans;
    }
    return loans.filter(loan =>
      loan.loan_account_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [loans, searchTerm]);

  const loanStats = useMemo(() => {
    const totalUploaded = loans.length;
    const totalModtApproved = loans.filter(loan => loan.modt_approval_status === 'approved').length;
    const totalModtRejected = loans.filter(loan => loan.modt_approval_status === 'rejected').length;
    const totalModtPending = loans.filter(loan => loan.modt_approval_status === 'pending').length;
    const totalNoiIndexApproved = loans.filter(loan => loan.noi_index2_approval_status === 'approved').length;
    const totalNoiIndexRejected = loans.filter(loan => loan.noi_index2_approval_status === 'rejected').length;
    const totalNoiIndexPending = loans.filter(loan => loan.noi_index2_approval_status === 'pending').length;
    
    return { 
      totalUploaded, 
      totalModtApproved, 
      totalModtRejected, 
      totalModtPending,
      totalNoiIndexApproved,
      totalNoiIndexRejected,
      totalNoiIndexPending
    };
  }, [loans]);

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


  const handleSignOut = async () => {
    try {
      localStorage.clear(); 
      await fetch('/api/auth/signout', { method: 'POST' }); 
      toast.success("Signed out successfully.");
      router.push('/signin');
    } catch (error) {
      toast.error('An error occurred during sign-out.');
    }
  };


  const getStatusBadge = (status) => {
    const lowerCaseStatus = status?.toLowerCase() || 'pending';
    switch (lowerCaseStatus) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500 text-white hover:bg-green-600">{status}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{status}</Badge>;
      case 'pending':
      default:
        return <Badge variant="PENDING">{status}</Badge>;
    }
  };

  
  const DocumentLink = ({ docUrl, label }) => {
   
    if (!docUrl) return null;

    return (
      <a
        href={docUrl} 
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <ExternalLink className="w-4 h-4 text-blue-500" />
      </a>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <div className="shadow-xs">
        <Navbar className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <NavBody>
            <NavbarLogo />
            <NavItems items={[]} />
            <div className="flex items-center gap-4">
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-pink-500 focus:ring-white"
                >
                  {userName.charAt(0).toUpperCase()}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 dark:bg-gray-800 border dark:border-gray-700">
                    <div className="px-4 py-2 border-b dark:border-gray-600">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </NavBody>
        </Navbar>
      </div>
      
   
      <main className="p-4 md:p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Loan Management Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review all loan applications.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Uploaded" value={loanStats.totalUploaded} icon={<Upload className="h-6 w-6 text-blue-500" />} color="bg-blue-100" />
          <StatCard title="MODT Approved" value={loanStats.totalModtApproved} icon={<CheckCircle className="h-6 w-6 text-green-500" />} color="bg-green-100" />
          <StatCard title="MODT Rejected" value={loanStats.totalModtRejected} icon={<XCircle className="h-6 w-6 text-red-500" />} color="bg-red-100" />
          <StatCard title="MODT Pending" value={loanStats.totalModtPending} icon={<Clock className="h-6 w-6 text-yellow-500" />} color="bg-yellow-100" />
          <StatCard title="NOI Index Approved" value={loanStats.totalNoiIndexApproved} icon={<CheckCircle className="h-6 w-6 text-green-500" />} color="bg-green-100" />
          <StatCard title="NOI Index Rejected" value={loanStats.totalNoiIndexRejected} icon={<XCircle className="h-6 w-6 text-red-500" />} color="bg-red-100" />
          <StatCard title="NOI Index Pending" value={loanStats.totalNoiIndexPending} icon={<Clock className="h-6 w-6 text-yellow-500" />} color="bg-yellow-100" />
        </div>

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

        <div className="rounded-lg border dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan Account Number</TableHead>
                <TableHead>MODT Approval</TableHead>
                <TableHead>NOI Index2 Approval</TableHead>
                <TableHead>Date Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center h-24">Loading loans...</TableCell></TableRow>
              ) : paginatedLoans.length > 0 ? (
                paginatedLoans.map((loan) => (
                  <TableRow key={loan.id} onClick={() => setSelectedLoan(loan)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell className="font-medium">{loan.loan_account_number}</TableCell>
                    <TableCell className="pl-5">{getStatusBadge(loan.modt_approval_status)}</TableCell>
                    <TableCell className="pl-5">{getStatusBadge(loan.noi_index2_approval_status)}</TableCell>
                    <TableCell>{new Date(loan.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center h-24">No loans found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
           <div className="flex items-center justify-center mt-5 space-x-2 py-4 px-4 border-t pr-20">
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
      </main>

   
      <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
        <DialogContent className="sm:max-w-[625px]">
          {selectedLoan && (
            <>
              <DialogHeader>
                <DialogTitle>Loan Application Details</DialogTitle>
                <DialogDescription>Account No: {selectedLoan.loan_account_number}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="font-semibold mb-3 text-lg flex items-center gap-2"><Info className="w-5 h-5" />Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                   
                    <div className="flex flex-col gap-1"><span className="text-gray-500">MODT Approval</span>{getStatusBadge(selectedLoan.modt_approval_status)}</div>
                    <div className="flex flex-col gap-1"><span className="text-gray-500">NOI Index2 Approval</span>{getStatusBadge(selectedLoan.noi_index2_approval_status)}</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="font-semibold mb-2 text-lg">Documents</h3>
                  <div className="space-y-1">
                    <DocumentLink docUrl={selectedLoan.modt} label="MODT" />
                    <DocumentLink docUrl={selectedLoan.noi_receipt} label="NOI Receipt" />
                    <DocumentLink docUrl={selectedLoan.noi_data_entry_page} label="NOI Data Entry Page" />
                    <DocumentLink docUrl={selectedLoan.noi_index2} label="NOI Index2" />
                  </div>
                </div>
               
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Toaster position="bottom-right" />
    </div>
  );
}
