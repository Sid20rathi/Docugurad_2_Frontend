'use client';

import React, { useEffect, useState ,useRef} from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { FlipWords } from "@/components/ui/flip-words";

import { useRouter } from "next/navigation";
import axios from "axios"
import { LinearGradient } from 'react-text-gradients'
import toast, { Toaster } from 'react-hot-toast';
import { ShieldCheck, ShieldAlert, ShieldQuestion, FileScan, ArrowLeft, LogOut } from 'lucide-react';

 

  import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import GradientText from "@/components/ui/gradient_text";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AdminPanel } from "@/components/admin/AdminPanel";





export default function Dashboard() {
  const words = ["Forgery", "Tampering", "Cloning", "Manipulation", "Fake", "Copy", "Counterfeit"];
  const [isAdmin, setIsAdmin] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  
  
  const [originalFile, setOriginalFile] = useState(null);
  const [suspectedFile, setSuspectedFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [suspectedPreview, setSuspectedPreview] = useState(null);
  const [loading, setLoading] = useState(false);
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


    const handleCheck = async () => {
    if (!originalFile || !suspectedFile) return;

    const formData = new FormData();
    formData.append("original", originalFile);
    formData.append("suspected", suspectedFile);

    try {
      setLoading(true);
     


      
      const response = await axios.post("http://localhost:8000/api/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      

       

      
      localStorage.setItem("ai_output", JSON.stringify(response.data));
      router.push("/result");

      
      
    } catch (error) {
      console.error("Error comparing files:", error);
      toast.error("Failed to compare PDFs or images. Check console for errors.");
    } finally {
      setLoading(false);
    }
  };
  const newalert = ()=>{
    toast.error("Pls upload both the files for comparison");
  }

 

  const navItems = [
   
   
   
  ];
 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


   const handleSignOut = async () => {
    try {
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_type");
      localStorage.removeItem("user_name");
      

      
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        
        router.push('/signin');
      } else {
        
        console.error('Sign-out failed');
      }
    } catch (error) {
      console.error('An error occurred during sign-out:', error);
    }
  };





  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen  text-black">
        <div className="flex items-center gap-4">
          <span className="loading loading-spinner loading-xl text-warning"></span>
          <FileScan className="animate-pulse h-8 w-8 " />
          <p className="text-3xl font-serif"> <GradientText
            colors={["#000000", ["#6366F1", "#A855F7", "#EC4899"], "#000000"]}
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
      
        <div className=" shadow-xs">
            <Navbar className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
       
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
          {isAdmin &&(
                <>
                  <NavbarButton 
                    
                    onClick={() => router.push('/verification')}
                  
                  >
                    Verify Documents
                  </NavbarButton>
                </>
              )}
            
           
              {isAdmin  && (
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
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Sign Out
              </NavbarButton>
             
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

        </div>
        
      
      <div className="w-full h-full flex items-center justify-center flex-col mt-20">
        <div> 
           
           
            <div  className="flex justify-center text-8xl font-serif">
                 <GradientText
            colors={["#000000", ["#6366F1", "#A855F7", "#EC4899"], "#000000"]}
            animationSpeed={9}
            showBorder={false}>
              
                DocuGuard 
                
            </GradientText>
               
                

            </div>
            <div className="text-xl text-neutral-500 font-serif flex justify-center">
            (AI based document fraud detection)


            </div>
          <span className="text-4xl font-serif pt-16 flex justify-center">
             For Document <FlipWords words={words} duration={500} className="text-indigo-500" /> Detector
          </span>
          <div className="flex justify-center mt-3 text-neutral-500 font-serif underline">
            Upload an original and a suspected document to check for tampering.
          </div>
        </div>
      </div>

     
      <div className="flex flex-row justify-between ">
        
        
        <div className="ml-40 mt-32 font-serif flex flex-col items-center">
          <div className="pr-3 text-3xl w-80 overflow-hidden">Original Document</div>
          <div className="pb-7 mr-9">
            <FileUpload onChange={(files) => handleFileUpload(files, "original")} />
          </div>
          {originalPreview && (
            <div className="w-[300px] h-[400px] overflow-hidden border rounded shadow">
              {originalFile.type === "application/pdf" ? (
                <iframe src={originalPreview} className="w-full h-full" />
              ) : (
                <img src={originalPreview} alt="Original Preview" className="w-full h-auto" />
              )}
            </div>
          )}
        </div>

        
        <div className="mr-40 mt-32 font-serif flex flex-col items-center">
          <div className="pl-3 text-3xl ">Duplicate Document  </div>
          <div className="pb-7 mr-9">
            <FileUpload onChange={(files) => handleFileUpload(files, "suspected")} />
          </div>
          {suspectedPreview && (
            <div className="w-[300px] h-[400px] overflow-hidden border rounded shadow">
              {suspectedFile.type === "application/pdf" ? (
                <iframe src={suspectedPreview} className="w-full h-full" />
              ) : (
                <img src={suspectedPreview} alt="Suspected Preview" className="w-full h-auto" />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center mt-10">
        {originalFile && suspectedFile ? (
             <div className="flex items-center gap-4 m-7 mb-4 ">
            <NavbarButton variant="gradient" onClick={handleCheck}>Check for Tampering</NavbarButton>
            
          </div>
            
          
        ) : (
             <div className="flex items-center gap-4 m-7 ">
            <NavbarButton variant="secondary" onClick={newalert}>Upload Both Files</NavbarButton>
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
               
          
        ) 
        
        }
      </div>
    </div>
  );
}
