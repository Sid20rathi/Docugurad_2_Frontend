'use client';

import React, { useEffect, useState, useRef } from "react";
import Tiff from 'tiff.js'; 
import { FileUpload } from "@/components/ui/file-upload";
import { FlipWords } from "@/components/ui/flip-words";
import { useRouter,useSearchParams } from "next/navigation";
import axios from "axios"
import { LinearGradient } from 'react-text-gradients'
import toast, { Toaster } from 'react-hot-toast';
import { FileScan, LogOut } from 'lucide-react';
import { Navbar, NavBody, NavItems, MobileNav, NavbarLogo, NavbarButton, MobileNavHeader, MobileNavToggle, MobileNavMenu } from "@/components/ui/resizable-navbar";
import GradientText from "@/components/ui/gradient_text";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AdminPanel } from "@/components/admin/AdminPanel";


export default function Dashboard() {
  let apiUrl = process.env.NEXT_PUBLIC_Backend_URL;
  let pathURL = process.env.NEXT_PUBLIC_Backend_URL;
 
  const words = ["Forgery", "Tampering", "Cloning", "Manipulation", "Fake", "Copy", "Counterfeit"];
  const [isAdmin, setIsAdmin] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [loanAccountNumber, setLoanAccountNumber] = useState("");
  const [fileType, setFileType] = useState("");
  
  const [originalFile, setOriginalFile] = useState(null);
  const [suspectedFile, setSuspectedFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [suspectedPreview, setSuspectedPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [analysisLogs, setAnalysisLogs] = useState([]);
  

  const originalCanvasRef = useRef(null);
  const suspectedCanvasRef = useRef(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (originalFile && suspectedFile) {
      toast.success("Files are ready. You can check for tampering!");
    }
  }, [originalFile, suspectedFile]);

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
    setUserName(storedUserName || "admin");

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
    if (loanAccNum) setLoanAccountNumber(loanAccNum);
    if (fType) setFileType(fType);
  }, [searchParams]);

  
  useEffect(() => {
    const renderTiff = async (file, previewUrl, canvasRef) => {
   
      if (file && file.type === "image/tiff" && previewUrl && canvasRef.current) {
        try {
    
          const response = await fetch(previewUrl);
          const arrayBuffer = await response.arrayBuffer();
          const tiff = new Tiff({ buffer: arrayBuffer });
          const canvas = canvasRef.current;
          const context = canvas.getContext("2d");

  
          canvas.width = tiff.width();
          canvas.height = tiff.height();
          
         
          context.drawImage(tiff.toCanvas(), 0, 0);
        } catch (error) {
          console.error("Failed to render TIFF file:", error);
          toast.error("Could not display the TIFF file preview.");
        }
      }
    };

    renderTiff(originalFile, originalPreview, originalCanvasRef);
    renderTiff(suspectedFile, suspectedPreview, suspectedCanvasRef);
  }, [originalFile, originalPreview, suspectedFile, suspectedPreview]);

  const handleFileUpload = (fileList, type) => {
    const file = fileList[0];
    if (!(file instanceof Blob)) {
      console.error("Invalid file:", file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileUrl = e.target.result;
      if (type === "original") {
        setOriginalFile(file);
        setOriginalPreview(fileUrl);
      } else {
        setSuspectedFile(file);
        setSuspectedPreview(fileUrl);
      }
    };
    reader.readAsDataURL(file); 
  };

  const handleCheck = async (loanAccountNumber) => {
    if (!originalFile || !suspectedFile) return;
    const formData = new FormData();
    formData.append("originalFile", originalFile);
    formData.append("suspectedFile", suspectedFile);
    try {
      setLoading(true);
      setAnalysisLogs(["Uploading documents to the server..."]);
      const response = await axios.post(`${apiUrl}/title_document/api/verify`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const Pathresponse = await fetch(
  `${pathURL}/model_used/api/Title_Document?user_email=${email}&user_name=${userName}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
   
    body: JSON.stringify({}), 
  }
);

if (!Pathresponse.ok) {
  throw new Error(`HTTP error! status: ${Pathresponse.status}`);
}






      const { task_id } = response.data;
      if (!task_id) {
          throw new Error("Failed to start analysis task on the server.");
      }
      setAnalysisLogs(prev => [...prev, `Task started with ID: ${task_id}`]);
      const eventSource = new EventSource(`${apiUrl}/title_document/api/stream/${task_id}`);
      eventSource.onmessage = (event) => {
        const data = event.data;
        if (data === "[DONE]") {
          toast.success("Analysis complete! Redirecting...");
          eventSource.close();
          return;
        }
        try {
            const finalResult = JSON.parse(data);
            localStorage.setItem("ai_output", JSON.stringify(finalResult));
            const pathname = `/result`;
            const queryParams = new URLSearchParams({ loanAccountNumber });
            router.push(`${pathname}?${queryParams.toString()}`);
        } catch (error) {
            setAnalysisLogs(prev => [...prev, data]);
        }
      };
      eventSource.onerror = (error) => {
        console.error("EventSource failed:", error);
        toast.error("Connection to server lost. Please try again.");
        eventSource.close();
        setLoading(false);
      };
    } catch (error) {
      console.error("Error starting file comparison:", error);
      toast.error("Failed to start analysis. Check console for errors.");
      setLoading(false);
    }
  };

  const newalert = () => {
    toast.error("Please upload both the files for comparison");
  };

  const navItems = [];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  if (loading) {
    return (
      <div className="flex items-center flex-col justify-center min-h-screen text-black">
        <div className="flex items-center gap-4">
          <span className="loading loading-spinner loading-xl text-warning"></span>
          <FileScan className="animate-pulse h-8 w-8 " />
          <p className="text-5xl font-serif">
            <GradientText
              colors={["#000000", ["#6366F1", "#A855F7", "#EC4899"], "#000000"]}
              animationSpeed={90}
              showBorder={false}>
              Analysis in progress...
            </GradientText>
          </p>
        </div>
        <div className="mt-8 p-4 w-full max-w-2xl h-64 overflow-y-auto text-center">
          {analysisLogs.length > 0 && (
            <p className="whitespace-pre-wrap text-indigo-600 text-xl font-serif">
              {`${analysisLogs[analysisLogs.length - 1]}`}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className=" shadow-xs">
        <Navbar className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
              {isAdmin && (
                <NavbarButton onClick={() => router.push('/verification')}>
                  Dashboard
                </NavbarButton>
              )}
              {isAdmin && (
                <Dialog>
                  <DialogTrigger asChild>
                    <NavbarButton variant="primary">Admin Panel</NavbarButton>
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
          <MobileNav>
            <MobileNavHeader>
              <NavbarLogo />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </MobileNavHeader>
            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            >
              {navItems.map((item, idx) => (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-neutral-600 dark:text-neutral-300"
                >
                  <span className="block">{item.name}</span>
                </a>
              ))}
              <div className="flex w-full flex-col gap-4">
                <NavbarButton onClick={() => setIsMobileMenuOpen(false)} variant="primary" className="w-full">
                  Sign Out
                </NavbarButton>
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
      </div>
      <div className="w-full h-full flex items-center justify-center flex-col mt-20"></div>
      <div className="mt-10">
        <div className="text-center text-black mb-4">
            <p className="text-2xl font-serif"><strong>Loan Acc No:</strong>{<span className="text-3xl ml-3 font-sans">{loanAccountNumber}</span> || "N/A"}</p>
            <p className="text-xl font-serif mt-3"><strong>Document Type:</strong>{<span className="text-2xl ml-5 font-bold">{fileType}</span> || "N/A"}</p>
        </div>
      </div>
      <div className="flex flex-row justify-between ">
        <div className="ml-40 mt-32 font-serif flex flex-col items-center">
          <div className="pr-3 text-3xl w-80 overflow-hidden">Original Government </div>
          <div className="pr-3 text-3xl w-80 overflow-hidden pl-16"> Document</div>
          <div className="pb-7 mr-9">
            <FileUpload onChange={(files) => handleFileUpload(files, "original")} />
          </div>
          {originalPreview && (
            <div className="w-[300px] h-[400px] flex items-center justify-center overflow-hidden border rounded shadow bg-gray-100">
              {originalFile.type === "application/pdf" ? (
                <iframe src={originalPreview} className="w-full h-full" />
              ) : originalFile.type === "image/tiff" ? (
                <canvas ref={originalCanvasRef} className="max-w-full max-h-full object-contain" />
              ) : (
                <img src={originalPreview} alt="Original Preview" className="max-w-full max-h-full object-contain" />
              )}
            </div>
          )}
        </div>
        <div className="mr-40 mt-32 font-serif flex flex-col items-center">
          <div className="pl-3 text-3xl ">Agent Provided</div>
           <div className="pl-3 text-3xl "> Document</div>
          <div className="pb-7 mr-9">
            <FileUpload onChange={(files) => handleFileUpload(files, "suspected")} />
          </div>
          {suspectedPreview && (
            <div className="w-[300px] h-[400px] flex items-center justify-center overflow-hidden border rounded shadow bg-gray-100">
              {suspectedFile.type === "application/pdf" ? (
                <iframe src={suspectedPreview} className="w-full h-full" />
              ) : suspectedFile.type === "image/tiff" ? (
                <canvas ref={suspectedCanvasRef} className="max-w-full max-h-full object-contain" />
              ) : (
                <img src={suspectedPreview} alt="Suspected Preview" className="max-w-full max-h-full object-contain" />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center mt-10">
        {originalFile && suspectedFile ? (
          <div className="flex items-center gap-4 m-7 mb-4 ">
            <NavbarButton variant="gradient" onClick={() => handleCheck(loanAccountNumber)}>Check for Tampering</NavbarButton>
            <Toaster position="bottom-right" reverseOrder={false} toastOptions={{ style: { background: '#363636', color: '#fff' } }}/>
          </div>
        ) : (
          <div className="flex items-center gap-4 m-7 ">
            <NavbarButton variant="secondary" onClick={newalert}>Upload Both Files</NavbarButton>
            <Toaster position="bottom-right" reverseOrder={false} toastOptions={{ style: { background: '#363636', color: '#fff' } }}/>
          </div>
        )}
      </div>
    </div>
  );
}