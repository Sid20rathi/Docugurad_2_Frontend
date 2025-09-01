'use client';

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { LogOut } from 'lucide-react';

import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AdminPanel } from "@/components/admin/AdminPanel"; 
import { PendingLoansDashboard } from "../admin/PendingLoansDashboard";
import { CompletedUploadsDashboard } from "../admin/CompletedUploadsDashboard"; // Import the new component

export default function AdminPage() { 
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

 
  const [activeView, setActiveView] = useState('pending'); 

  const[view,setView] = useState(false);

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

  const navItems = [];

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

  return (
    <div>
      <div className="shadow-xs">
        <Navbar className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
            {isAdmin && view == false &&(
                <>
                  <NavbarButton 
                    variant={activeView === 'completed' ? 'primary' : 'secondary'}
                    onClick={() => setView(!view)}
                  >
                   Dashboard
                  </NavbarButton>
                </>
              )}
              {isAdmin && view == true &&(
                <>
                  <NavbarButton 
                    variant={activeView === 'pending' ? 'primary' : 'secondary'} 
                    onClick={() => setView(!view)}
                  >
                    Pending Verification
                  </NavbarButton>
                </>
              )}



               {/*{isAdmin &&(
                <>
                  <NavbarButton 
                    variant={activeView === 'pending' ? 'primary' : 'secondary'} 
                    onClick={() => router.push('/dashboard')}
                  
                  >
                    Document comparsion
                  </NavbarButton>
                </>
              )}  */}




              
            
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
        </Navbar>
      </div>
      <main className="container mx-auto p-4 md:p-8">
        {isAdmin && (
        
          view === false ? <PendingLoansDashboard /> : <CompletedUploadsDashboard />
        )}
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}