'use client';

import { ShieldCheck, ShieldAlert, ShieldQuestion, FileScan, LogOut, ArrowLeft, Download, Image as ImageIcon } from 'lucide-react';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
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
import { jsPDF } from 'jspdf';

export default function ResultPage() {

  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);  
  
  const [result, setResult] = useState(null);
  const [originalDocUrl, setOriginalDocUrl] = useState(null);
  const [suspectedDocUrl, setSuspectedDocUrl] = useState(null);
  const [docTypes, setDocTypes] = useState({ isOriginalPdf: false, isSuspectedPdf: false });

  const [loanAccountNumber, setLoanAccountNumber] = useState("");
  const [fileType, setFileType] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    try {
      const savedResult = localStorage.getItem('verification_result');
      const savedOriginalUrl = localStorage.getItem('original_doc_url');
      const savedSuspectedUrl = localStorage.getItem('suspected_doc_url');
      const savedDocTypes = localStorage.getItem('doc_types');
      const savedLoanNumber = localStorage.getItem('loan_account_number');
      const savedFileType = localStorage.getItem('file_type');

      if (savedResult && savedOriginalUrl && savedSuspectedUrl && savedLoanNumber && savedFileType) {
        setResult(JSON.parse(savedResult));
        setOriginalDocUrl(savedOriginalUrl);
        setSuspectedDocUrl(savedSuspectedUrl);
        setLoanAccountNumber(savedLoanNumber);
        setFileType(savedFileType);
        if (savedDocTypes) {
          setDocTypes(JSON.parse(savedDocTypes));
        }
      } else {
        console.warn("Required data not found in localStorage, redirecting.");
        router.push('/verification');
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      router.push('/verification');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.clear(); 
    router.push('/signin'); 
  };

  const navItems = [];

  const getEvidenceImagePairs = () => {
    if (!result || !result.page_by_page_analysis) return [];
    const pairs = [];
    result.page_by_page_analysis.forEach(pageAnalysis => {
      if (pageAnalysis.visual_analysis?.diff_image_url && pageAnalysis.visual_analysis?.original_image_url) {
        pairs.push({
          page: pageAnalysis.page,
          original: pageAnalysis.visual_analysis.original_image_url,
          diff: pageAnalysis.visual_analysis.diff_image_url,
        });
      }
    });
    return pairs;
  };

  function getVerdictDetails(verdict) {
    switch (verdict?.toLowerCase()) {
      case 'forged':
        return { Icon: ShieldAlert, color: 'text-red-500', bgColor: 'bg-red-100', borderColor: 'border-red-200', text: 'Document Appears Forged' };
      case 'authentic':
        return { Icon: ShieldCheck, color: 'text-green-500', bgColor: 'bg-green-100', borderColor: 'border-green-200', text: 'Document Appears Authentic' };
      default:
        return { Icon: ShieldQuestion, color: 'text-yellow-500', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-200', text: 'Analysis Inconclusive' };
    }
  }
  
  const downloadReportAsPDF = () => {
     if (!result) return;
    const pdf = new jsPDF();
    let yOffset = 20;
    const lineHeight = 7;
    const margin = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();
  
    const addText = (text, options = {}) => {
        pdf.setFontSize(options.size || 12);
        pdf.setFont(undefined, options.bold ? 'bold' : 'normal');
        const splitText = pdf.splitTextToSize(text, pageWidth - margin * 2);
        pdf.text(splitText, margin, yOffset);
        yOffset += (splitText.length * lineHeight) + (options.spacing || 0);
    };
    
    addText('Forensic Document Analysis Report', { size: 18, bold: true, spacing: 10 });
    const verdictInfo = getVerdictDetails(result.verdict);
    addText(`Verdict: ${verdictInfo.text}`, { size: 14, bold: true, spacing: 7 });
    addText('Analysis Summary', { bold: true, spacing: 4 });
    addText(`- Critical Findings: ${result.summary.critical_findings}`, { size: 11 });
    addText(`- Moderate Findings: ${result.summary.moderate_findings}`, { size: 11 });
    addText(`- Total Discrepancies: ${result.summary.total_discrepancies}`, { size: 11, spacing: 10 });
    addText('Detailed Findings', { bold: true, spacing: 4 });
    if (result.analysis_details && result.analysis_details.length > 0) {
      result.analysis_details.forEach(detail => {
        addText(`${detail.area}:`, { bold: true, spacing: 3 });
        detail.discrepancies.forEach(discrepancy => {
          addText(`  - [${discrepancy.severity}] ${discrepancy.description}`, { size: 11, spacing: 2 });
        });
        yOffset += 5; 
      });
    } else {
      addText('No discrepancies found.', { size: 11 });
    }

    pdf.save(`Forensic_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const verdictDetails = React.useMemo(() => getVerdictDetails(result?.verdict), [result]);
  const imagePairs = React.useMemo(() => getEvidenceImagePairs(), [result]);

  const handleApproval = async (status) => {
    if (!loanAccountNumber || !fileType) {
        toast.error("Could not find Loan Account Number or File Type.");
        return;
    }
    setIsUpdating(true)
    toast.success("Updating......");
    const toastId = toast.loading(`Setting status to ${status}...`);
  
    try {
        const response = await fetch('/api/loans/approve', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                loanAccountNumber: loanAccountNumber,
                documentType: fileType,
                status: status,
            }),
        });
  
        const responseData = await response.json();
  
        if (!response.ok) {
            throw new Error(responseData.error || 'Failed to update status.');
        }
  
        toast.success(`Document marked as ${status}!`, { id: toastId });
  
        setTimeout(() => {
            router.push('/verification');
        }, 1500);
  
    } catch (error) {
        toast.error(`Error: ${error.message}`, { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-800">
          <div className="flex items-center gap-4">
              <FileScan className="animate-pulse h-10 w-10 text-gray-500" />
              <p className="text-2xl font-serif animate-pulse">
                  Loading Analysis...
              </p>
          </div>
      </div>
    );
  }

  if (!result) { 
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
            <ShieldQuestion className="h-16 w-16 text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Analysis Data Found</h1>
            <p className="text-gray-600 mb-6">The analysis result could not be loaded.</p>
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 transition-all shadow-md hover:shadow-lg">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </button>
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
      <main className="text-gray-800 font-sans p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <button onClick={() => router.push('/verification')} className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Check Another Document</span>
            </button>
            <button onClick={downloadReportAsPDF} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 transition-all shadow-md hover:shadow-lg">
              <Download className="h-4 w-4" />
              <span>Download PDF Report</span>
            </button>
          </div>
          <div className={`border ${verdictDetails.borderColor} ${verdictDetails.bgColor} rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-6 shadow-lg`}>
            <verdictDetails.Icon className={`h-16 w-16 ${verdictDetails.color}`} />
            <div className="text-center sm:text-left">
              <h1 className={`text-2xl sm:text-3xl font-bold ${verdictDetails.color}`}>{verdictDetails.text}</h1>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-800 rounded-xl p-6 shadow-2xl mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-white text-center">Detailed Findings</h2>
            {result.analysis_details && result.analysis_details.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-200"><tr className="text-white"><th className="p-4 font-semibold">Description</th></tr></thead>
                  <tbody>
                    {result.analysis_details.map((detail, index) => (
                      <tr key={`${detail.area}-${index}`} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors align-top">
                        <td className="p-4 text-neutral-300">
                          <ul className="list-disc pl-5 space-y-3">{detail.discrepancies.map((d, dIndex) => (<li key={dIndex}>{d.description}</li>))}</ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800  rounded-lg">
                <ShieldCheck className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium text-white">No Discrepancies Found.</p>
                <p className="text-gray-600">The suspected document appears to be identical to the original.</p>
              </div>
            )}
          </div>
          {imagePairs.length > 0 && (
            <div className="bg-gray-800 border border-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-8 text-white text-center flex items-center justify-center gap-3">
                <ImageIcon className="h-6 w-6" />
                Visual Evidence Comparison
              </h2>
              <div className="flex flex-col gap-12">
                {imagePairs.map((pair, index) => (
                  <div key={index} className="border-t border-gray-200 pt-8 first:border-t-0 first:pt-0">
                    <h3 className="text-xl font-semibold text-white mb-4 text-center">
                      Comparison for Page {pair.page}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <div>
                        <h4 className="text-lg font-medium text-center text-white mb-3">Original</h4>
                        <img
                          src={pair.original}
                          alt={`Original document page ${pair.page}`}
                          className="w-full h-auto rounded-lg border-2 border-gray-300 shadow-md"
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-center text-red-600 mb-3">Suspected (Differences Highlighted)</h4>
                        <img
                          src={pair.diff}
                          alt={`Visual difference on page ${pair.page}`}
                          className="w-full h-auto rounded-lg border-2 border-red-500 shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Document Display Section - Now shows for ALL verdict types */}
          {originalDocUrl && suspectedDocUrl && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg mt-12">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                Document Comparison
              </h2>
              {verdictDetails.text === 'Document Appears Authentic' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-green-700 font-medium">
                    ✓ Both documents match perfectly. No discrepancies found.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold text-center mb-4">Original Document</h3>
                  <div className="w-full h-[800px] border-2 border-gray-300 rounded-lg shadow-inner overflow-hidden">
                    {docTypes.isOriginalPdf ? (
                      <iframe 
                        src={originalDocUrl} 
                        className="w-full h-full" 
                        title="Original Document"/>
                    ) : (
                      <img src={originalDocUrl} alt="Original Document" className="w-full h-full object-contain"/>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-center mb-4">Suspected Document</h3>
                  <div className="w-full h-[800px] border-2 border-gray-300 rounded-lg shadow-inner overflow-hidden">
                    {docTypes.isSuspectedPdf ? (
                      <iframe 
                        src={suspectedDocUrl}
                        className="w-full h-full" 
                        title="Suspected Document"/>
                    ) : (
                      <img src={suspectedDocUrl} alt="Suspected Document" className="w-full h-full object-contain"/>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <div className="flex justify-center mt-10 flex-row">
        <div>
          <NavbarButton 
              variant="primary" 
              className="bg-red-500 hover:bg-red-600 shadow-2xl mb-5 mr-3 text-white w-full" 
              onClick={() => handleApproval('rejected')}
              disabled={isUpdating}
          >
              {isUpdating ? 'Updating...' : 'Reject'}
          </NavbarButton>
        </div>
        <div>
          <NavbarButton 
              variant="primary" 
              className="bg-green-500 hover:bg-green-600 shadow-2xl mb-5 ml-3 text-white w-full" 
              onClick={() => handleApproval('approved')}
              disabled={isUpdating}
          >
              {isUpdating ? 'Updating...' : 'Approve'}
          </NavbarButton>
        </div>
      </div>
    </div>
  );
}