'use client';

import React, { useEffect, useState, useCallback } from "react"; 
import { useRouter } from "next/navigation";
import { StatusDashboard } from "@/components/dashboard/StatusDashboard"; 
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
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUploadForm } from "../forms/FileUploadForm";
import { SignOutModal } from "../modals/SignOutModal";

export function Agent_page() {
  const [isAdmin, setIsAdmin] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userName, setUserName] = useState("");
  

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isnewModalOpen, setIsnewModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  

  const handleUploadComplete = useCallback(() => {
    setIsModalOpen(false);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    const storedIsAdmin = localStorage.getItem("user_type");
    const storedUserName = localStorage.getItem("user_name");

    if (!storedEmail) {
      router.push("/signin");
      return;
    }
    setUserName(storedUserName);

    setEmail(storedEmail);
    setIsAdmin(storedIsAdmin);
    setLoading(false);
  }, [router]);

  const navItems = [];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const move_to_all = () => {

    router.push('/verification/uploaded')
  }


  const handleSignOut = async () => {
    try {
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_type");
      
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
      return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="shadow-xs">
        <Navbar className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
            {isAdmin ==='agent' && (
              <NavbarButton variant="primary" onClick={move_to_all}>Dashboard</NavbarButton>
            )}
            {isAdmin === 'agent' && (
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}> 
                  <DialogTrigger asChild>
                    <NavbarButton variant="primary">Upload files</NavbarButton>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Loan Application</DialogTitle>
                    </DialogHeader>
                  
                    <FileUploadForm userEmail={email} onUploadSuccess={handleUploadComplete} /> 
                  </DialogContent>
                </Dialog>
                
              )}
              <NavbarButton variant="primary" onClick={() => setIsnewModalOpen(true)}>
                Profile
              </NavbarButton>
            
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
                    onClick={handleSignOut}
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
    
      <main className="container mx-auto p-8 w-full md:p-8">
        <StatusDashboard key={refreshKey} />
      </main>

      <SignOutModal
        isOpen={isnewModalOpen}
        onClose={() => setIsnewModalOpen(false)}
        onConfirm={handleSignOut}
        userName={userName}
        email={email}
      />



      
    </div>

    



  );
}
