'use client';

import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast, { Toaster } from 'react-hot-toast';


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
      // Stop propagation to prevent the row's onClick from firing when the link is clicked
      onClick={(e) => e.stopPropagation()}
    >
      {label}
    </a>
  );
};

export function StatusDashboard() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);

  const fetchPendingLoans = async () => {
    const userEmail = localStorage.getItem("user_email");
    if (!userEmail) {
      setError("User email not found. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/api/loans?status=pending&email=${userEmail}`);
      setLoans(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch loans:", err);
      setError("Could not load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  const handleFileUpload = async (loanId, documentType) => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("loanId", loanId);
    formData.append("documentType", documentType);

    try {
      const toastId = toast.loading('Uploading file...');
      await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success("File uploaded successfully!", { id: toastId });
      setIsModalOpen(false);
      setSelectedLoan(null);
      fetchPendingLoans(); 
    } catch (error)
    {
      console.error("File upload failed:", error);
      toast.error("File upload failed. Please try again.");
    }
  };

  const handleRowClick = (loan) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="rounded-md border p-4">
        <h2 className="text-2xl font-bold mb-4">Pending loan documents</h2>
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
      <Toaster position="bottom-right" />
      <div className="rounded-md border shadow-xl w-full">
        <h2 className="text-2xl font-bold p-4">Pending loan documents</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Loan Account No.</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead>MODT</TableHead>
              <TableHead>NOI DATA ENTRY</TableHead>
              <TableHead>NOI Receipt</TableHead>
              <TableHead>NOI Index2</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.length > 0 ? (
              loans.map((loan) => (
                <TableRow
                  key={loan.id}
                  onClick={() => handleRowClick(loan)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <TableCell className="font-medium">{loan.loan_account_number}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{loan.status.toUpperCase()}</Badge>
                  </TableCell>
                  {/* --- MODIFIED: Use the ViewFileLink component --- */}
                  <TableCell><ViewFileLink filePath={loan.modt} /></TableCell>
                  <TableCell><ViewFileLink filePath={loan.noi_data_entry_page} /></TableCell>
                  <TableCell><ViewFileLink filePath={loan.noi_receipt} /></TableCell>
                  <TableCell><ViewFileLink filePath={loan.noi_index2} /></TableCell>
                  <TableCell className="text-right">
                    {new Date(loan.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  No pending files found for your account.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Documents for: {selectedLoan?.loan_account_number}</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4 mt-4">
              {/* --- MODIFIED: Modal sections now show link or upload input --- */}
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-bold">MODT Document</p>
                  {selectedLoan.modt ? (
                    <ViewFileLink filePath={selectedLoan.modt} label="View Uploaded File" />
                  ) : (
                    <p className="text-sm text-gray-500">No file uploaded.</p>
                  )}
                </div>
                {!selectedLoan.modt && (
                  <div className="flex items-center gap-2">
                    <Input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-48" />
                    <Button onClick={() => handleFileUpload(selectedLoan.id, 'modt')}>Upload</Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-bold">NOI DATA ENTRY</p>
                  {selectedLoan.noi_data_entry_page ? (
                    <ViewFileLink filePath={selectedLoan.noi_data_entry_page} label="View Uploaded File" />
                  ) : (
                    <p className="text-sm text-gray-500">No file uploaded.</p>
                  )}
                </div>
                {!selectedLoan.noi_data_entry_page && (
                  <div className="flex items-center gap-2">
                    <Input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-48" />
                    <Button onClick={() => handleFileUpload(selectedLoan.id, 'noi_data_entry_page')}>Upload</Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-bold">NOI Receipt</p>
                  {selectedLoan.noi_receipt ? (
                    <ViewFileLink filePath={selectedLoan.noi_receipt} label="View Uploaded File" />
                  ) : (
                    <p className="text-sm text-gray-500">No file uploaded.</p>
                  )}
                </div>
                {!selectedLoan.noi_receipt && (
                  <div className="flex items-center gap-2">
                    <Input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-48" />
                    <Button onClick={() => handleFileUpload(selectedLoan.id, 'noi_receipt')}>Upload</Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-bold">NOI Index2</p>
                  {selectedLoan.noi_index2 ? (
                    <ViewFileLink filePath={selectedLoan.noi_index2} label="View Uploaded File" />
                  ) : (
                    <p className="text-sm text-gray-500">No file uploaded.</p>
                  )}
                </div>
                {!selectedLoan.noi_index2 && (
                  <div className="flex items-center gap-2">
                    <Input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-48" />
                    <Button onClick={() => handleFileUpload(selectedLoan.id, 'noi_index2')}>Upload</Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
