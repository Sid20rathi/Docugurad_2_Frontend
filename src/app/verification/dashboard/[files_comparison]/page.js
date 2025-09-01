'use client';

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, FileScan, LogOut } from 'lucide-react';
import { FileUpload } from "@/components/ui/file-upload";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AdminPanel } from "@/components/admin/AdminPanel"; 
import GradientText from "@/components/ui/gradient_text";

export default function AdminPage() { 
 
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);


  const [originalFile, setOriginalFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  
 
  const [loanAccountNumber, setLoanAccountNumber] = useState("");
  const [fileType, setFileType] = useState("");
  const [suspectedFileUrl, setSuspectedFileUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    const storedIsAdmin = localStorage.getItem("user_type");
    const storedUserName = localStorage.getItem("user_name");

    if (!storedEmail || storedIsAdmin !== 'admin') {
      toast.error("Access Denied. Redirecting to sign-in.");
      router.push("/signin");
      return;
    }

    setEmail(storedEmail);
    setIsAdmin(true);
    setUserName(storedUserName || "Admin");

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

  useEffect(() => {
    const loanAccNum = searchParams.get("loanAccountNumber");
    const fType = searchParams.get("fileType");
    const fPath = searchParams.get("filePath");

    if (loanAccNum) setLoanAccountNumber(loanAccNum);
    if (fType) setFileType(fType);
    if (fPath) {
      try {
        const decodedPath = decodeURIComponent(decodeURIComponent(fPath));
        setSuspectedFileUrl(decodedPath);
      } catch (e) {
        console.error("Failed to decode filePath:", e);
        toast.error("Invalid file path in URL.");
      }
    }
  }, [searchParams]);

  const navItems = [];
  
  const newalert = () => {
    toast.error("Please upload the original file for comparison");
  }

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_type");
      localStorage.removeItem("user_name");
      const response = await fetch('/api/auth/signout', { method: 'POST' });
      if (response.ok) {
        router.push('/signin');
      } else {
        toast.error('Sign-out failed.');
      }
    } catch (error) {
      toast.error('An error occurred during sign-out.');
    }
  };

  const handleFileUpload = (files) => {
    const file = files[0];
    if (file) {
      // 1. Create a new FileReader instance
      const reader = new FileReader();
  
      // 2. Set up the function to run when reading is complete
      reader.onload = (e) => {
        // e.target.result contains the Base64 encoded data: URL
        setOriginalPreview(e.target.result);
      };
  
      // 3. Start reading the file
      // This will trigger the 'onload' function when done
      reader.readAsDataURL(file);
  
      // Also, save the file object itself for the API submission
      setOriginalFile(file);
    }
  };
  
  const handleCheck = async () => {
    if (!originalFile || !suspectedFileUrl) {
      toast.error("Please ensure the original file is uploaded and the URL is correct.");
      return;
    }
    setLoading(true);
    toast.loading('Comparing documents...');

    try {
     
      let apiUrl = "";
      if (fileType === 'MODT') {
        apiUrl = 'https://docugurad-backend.onrender.com/api/verify/MODT'; 
      } else if (fileType === 'NOI INDEX II') {
        apiUrl = 'https://docugurad-backend.onrender.com/api/verify/noi_index';
      } else {
        throw new Error("Invalid document type specified.");
      }
      
      const response = await fetch(suspectedFileUrl);
      if (!response.ok) {
        throw new Error('Network response for suspected file was not ok');
      }
      const suspectedBlob = await response.blob();
      
      const formData = new FormData();
      formData.append('originalFile', originalFile); 
      formData.append('suspectedFile', suspectedBlob, suspectedFileUrl.split('/').pop());

      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      toast.dismiss(); 

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Backend request failed.');
      }

      const resultData = await apiResponse.json();
      toast.success('Comparison complete!');
      localStorage.setItem('loan_account_number', loanAccountNumber);
      localStorage.setItem('file_type', fileType);

      localStorage.setItem('verification_result', JSON.stringify(resultData));
      localStorage.setItem('original_doc_url', originalPreview);
      localStorage.setItem('suspected_doc_url', suspectedFileUrl);
      localStorage.setItem('doc_types', JSON.stringify({
        isOriginalPdf: originalFile?.type === "application/pdf",
        isSuspectedPdf: suspectedFileUrl.toLowerCase().endsWith('.pdf')
      }));


      router.push('/verification/dashboard/result');

    } catch (error) {
      toast.dismiss();
      toast.error(error.message || 'Failed to fetch or compare the documents.');
      console.error("Comparison error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSuspectedPdf = suspectedFileUrl.toLowerCase().endsWith('.pdf');
  const isOriginalPdf = originalFile?.type === "application/pdf";
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen  text-black">
        <div className="flex items-center gap-4">
          <span className="loading loading-spinner loading-xl text-warning"></span>
          <FileScan className="animate-pulse h-8 w-8 " />
          <p className="text-3xl font-serif"> <GradientText
            colors={["#000000", "#6366F1", "#A855F7", "#EC4899", "#000000"]}
            animationSpeed={90}
            showBorder={false}>
                Analyzing Results...  
            </GradientText></p>
        </div>
      </div>
    );
  }


  return (
    <div>
      <div className="shadow-xs">
        <Navbar className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Dialog>
                  <DialogTrigger asChild>
                    <NavbarButton variant="primary">Admin</NavbarButton>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px]">
                    <AdminPanel />
                  </DialogContent>
                </Dialog>
              )}
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
          <MobileNav></MobileNav>
        </Navbar>
      </div>
      <div>
        <button onClick={() => router.push('/verification')} className="flex items-center mt-5 ml-6 gap-2 text-gray-600 hover:text-black transition-colors group">
            <ArrowLeft className="h-4 w-4 transition-transform text-neutral-500 group-hover:-translate-x-1" />
            <span className="text-neutral-500">Back to dashboard</span>
        </button>
      </div>
      <div className="mt-10">
        <div className="text-center text-black mb-4">
            <p className="text-2xl font-serif"><strong>Loan Acc No:</strong>{<span className="text-3xl ml-3 font-sans">{loanAccountNumber}</span> || "N/A"}</p>
            <p className="text-xl font-serif mt-3"><strong>Document Type:</strong>{<span className="text-2xl ml-5 font-bold">{fileType}</span> || "N/A"}</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-around items-start p-4 md:p-10">
        <div className="font-serif flex flex-col items-center w-full md:w-auto mb-10 md:mb-0">
          <div className="text-3xl mb-4">Your Original Document</div>
          {originalPreview ? (
            <div className="w-[450px] h-[600px] overflow-hidden border rounded shadow">
              {isOriginalPdf ? (
                <iframe src={originalPreview} className="w-full h-full" title="Original Document Preview" />
              ) : (
                <img src={originalPreview} alt="Original Preview" className="w-full h-full object-contain" />
              )}
            </div>
          ) : (
            <div className="w-[450px] h-[600px] border rounded shadow flex items-center justify-center p-4">
              <FileUpload onChange={handleFileUpload} />
            </div>
          )}
        </div>
        <div className="font-serif flex flex-col items-center w-full md:w-auto">
          <div className="text-3xl mb-2">Uploaded Document</div>
          {suspectedFileUrl ? (
            <div className="w-[450px] h-[600px] overflow-hidden border rounded shadow">
              {isSuspectedPdf ? (
                <iframe src={suspectedFileUrl} className="w-full h-full" title="Suspected Document Preview" />
              ) : (
                <img src={suspectedFileUrl} alt="Suspected Document Preview" className="w-full h-full object-contain" />
              )}
            </div>
          ) : (
             <div className="w-[450px] h-[600px] flex items-center justify-center text-gray-500 border rounded shadow">
                <p>No document found in URL.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-10">
        {originalFile && suspectedFileUrl ? (
             <div className="flex items-center gap-4 m-7 mb-4 ">
                <NavbarButton variant="gradient" onClick={handleCheck} disabled={loading}>
                    {loading ? "Checking..." : "Check for Tampering"}
                </NavbarButton>
            </div>
        ) : (
             <div className="flex items-center gap-4 m-7 ">
                <NavbarButton variant="secondary" onClick={newalert}>Upload Original File</NavbarButton>
             </div>
        )}
      </div>
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
    </div>
  );
}