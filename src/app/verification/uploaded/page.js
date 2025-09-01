"use client"
import React, { useEffect, useState } from "react"; 
import { useRouter } from "next/navigation";
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
import { AllLoansDashboard } from "@/components/dashboard/AllLoansDashboard";
// --- NEW: Import the modal component we created earlier ---
import { SignOutModal } from "@/components/modals/SignOutModal";

export default function Uploaded() {
  const [isAdmin, setIsAdmin] = useState("");
  const [email, setEmail] = useState("");
 
  const [userName, setUserName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    const storedIsAdmin = localStorage.getItem("user_type");
  
    const storedUserName = localStorage.getItem("user_name");

    if (!storedEmail) {
      router.push("/signin");
      return;
    }

    setEmail(storedEmail);
    setIsAdmin(storedIsAdmin);
   
    setUserName(storedUserName || "User");
    setLoading(false);
  }, [router]);

  const navItems = [];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const move_to_pending = () => {
    router.push('/verification');
  };

  // --- UPDATED: This function is now called by the modal's confirm button ---
  const handleSignOut = async () => {
    try {
      // --- UPDATED: Clear all user items from localStorage ---
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_type");
      localStorage.removeItem("user_name");
      
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        setIsModalOpen(false); // Close the modal
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
              {isAdmin === 'agent' && (
                <NavbarButton variant="primary" onClick={move_to_pending}>Pending Files</NavbarButton>
              )}
             
            
              <NavbarButton variant="primary" onClick={() => setIsModalOpen(true)}>
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
                {/* --- UPDATED: Mobile button also opens the modal --- */}
                <NavbarButton
                    onClick={() => {
                      setIsMobileMenuOpen(false); // First close the nav
                      setIsModalOpen(true);       // Then open the modal
                    }}
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
        <AllLoansDashboard />
      </main>

      
      <SignOutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleSignOut}
        userName={userName}
        email={email}
      />
    </div>
  );
}
