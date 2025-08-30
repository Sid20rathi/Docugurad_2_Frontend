'use client';

import React, { useEffect, useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { FlipWords } from "@/components/ui/flip-words";

import { useRouter } from "next/navigation";
import axios from "axios"
import { LinearGradient } from 'react-text-gradients'
import toast, { Toaster } from 'react-hot-toast';
import { ShieldCheck, ShieldAlert, ShieldQuestion, FileScan, ArrowLeft } from 'lucide-react';

 

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
import { Agent_page } from "@/components/pages/agent";
import AdminPage, { Admin_page } from "@/components/pages/admin";
import Managerpages from "@/components/pages/manager";





export default function Verification() {
  
  const [isAdmin, setIsAdmin] = useState("");
  const [email, setEmail] = useState("");
  
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    const storedIsAdmin = localStorage.getItem("user_type");

    if (!storedEmail) {
      
      router.push("/signin");
      return;
    }

    setEmail(storedEmail);
    setIsAdmin(storedIsAdmin);
    setLoading(false);
   
  }, [router]);

  


    
 

 

  const navItems = [
   
   
   
  ];
 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


   const handleSignOut = async () => {
    try {
      
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
            colors={["#000000", "#FBBF24", "#FCD34D", "#FBBF24", "#000000"]}
            animationSpeed={90}
            showBorder={false}>
                Analyzing Results...  
            </GradientText></p>
        </div>
      </div>
    );
  }
  

  if(isAdmin=="admin"){
   return(
    <div><AdminPage/></div>
    
   )
  }

  if(isAdmin=="manager"){
    return(
        <div><Managerpages/></div>
    )

  }

  if(isAdmin=="agent"){
   return(
    <div>
        <Agent_page/>
    </div>
   )
  }

  return (
    <div>
      
        <div className=" shadow-xs">
            <Navbar className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
       
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton variant="primary" onClick={handleSignOut}>Sign Out</NavbarButton>
            {isAdmin =='admin' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <NavbarButton variant="primary">Admin</NavbarButton>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <AdminPanel />
                  </DialogContent>
                </Dialog>
              )}
            
            
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
        <div>
          
        </div>
        
      
      

     
     
    </div>
  );
}
