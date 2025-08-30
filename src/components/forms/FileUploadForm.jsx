'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast, { Toaster } from 'react-hot-toast';

export function FileUploadForm({ userEmail, onUploadSuccess }) {
  const [loanAccountNumber, setLoanAccountNumber] = useState('');
  const [files, setFiles] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles.length > 0) {
      setFiles((prev) => ({ ...prev, [name]: inputFiles[0] }));
    }
  };

  // 1. This function ONLY allows numbers to be set in the state.
  const handleLoanNumberChange = (e) => {
    // This regex removes any character that is not a digit (0-9).
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    setLoanAccountNumber(numericValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loanAccountNumber) {
      setMessage({ type: 'error', text: 'Loan Account Number is required.' });
      return;
    }
  
    if (!userEmail) {
        setMessage({ type: 'error', text: 'User session not found. Please refresh.' });
        return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('loanAccountNumber', loanAccountNumber);
    formData.append('userEmail', userEmail); 

    if (files.modt) formData.append('modt', files.modt);
    if (files.noi_data_entry_page) formData.append('noi_data_entry_page', files.noi_data_entry_page);
    if (files.noi_receipt) formData.append('noi_receipt', files.noi_receipt);
    if (files.noi_index2) formData.append('noi_index2', files.noi_index2);

    try {
      await axios.post('/api/loans/create', formData);

      setMessage({ type: 'success', text: 'Loan application created successfully!' });
      toast.success("Loan application created successfully!");
      
      setLoanAccountNumber('');
      setFiles({});
      e.target.reset();
      
      if (onUploadSuccess) onUploadSuccess();
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An unexpected error occurred.';
      setMessage({ type: 'error', text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 m-3">
      <div>
        <Label htmlFor="loanAccountNumber">Loan Account Number *</Label>
        <Input
          id="loanAccountNumber"    
          type="text"
          // 2. The value of the input is tied directly to our state.
          value={loanAccountNumber}
          // 3. CRUCIAL: The onChange prop MUST call our new validation function.
          onChange={handleLoanNumberChange}
          placeholder="e.g., 10023"
          required
          className="mt-2"
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </div>
      
      <div>
        <Label htmlFor="modt">MODT Document</Label>
        <Input id="modt" name="modt" type="file" onChange={handleFileChange} className="mt-2" />
      </div>

      <div>
        <Label htmlFor="noi_data_entry_page">NOI DATA ENTRY PAGE</Label>
        <Input id="noi_data_entry_page" name="noi_data_entry_page" type="file" onChange={handleFileChange} className="mt-2" />
      </div>

      <div>
        <Label htmlFor="noi_receipt">NOI Receipt</Label>
        <Input id="noi_receipt" name="noi_receipt" type="file" onChange={handleFileChange} className="mt-2"/>
      </div>

      <div>
        <Label htmlFor="noi_index2">NOI Index2</Label>
        <Input id="noi_index2" name="noi_index2" type="file" onChange={handleFileChange} className="mt-2" />
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Loan & Upload Files'}
      </Button>
      <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
              style: {
                  background: '#363636',
                  color: '#fff',
              },
          }}
      />

      {message.text && (
        <p className={`mt-4 text-center text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}