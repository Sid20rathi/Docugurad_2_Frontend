"use client"
import Image from "next/image";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
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
import { useRouter } from 'next/navigation';
import React, { useState } from "react";
import { AuroraText } from "@/components/magicui/aurora-text";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Timeline } from "@/components/ui/timeline";
import ColourfulText from "@/components/ui/colourful-text";

export default function Home() {
  const router = useRouter();
   const navItems = [
   
   
    {
      name: "Support",
      link: "#contact",
    },
  ];
 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const data = [
    {
      title: "Step 1: Register / Sign In",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
           Create your secure account to access DocuGuard's AI-powered detection dashboard.
          </p>
          <div className="grid grid-cols-2 gap-4">
          
            <img
              src="/signin.png"
              alt="startup template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-center shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            
           
          </div>
        </div>
      ),
    },
    {
      title: "Step 2: Upload Your Document",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            Upload scanned documents, images, or PDFs — we support a wide range of formats.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/dashboard.png"
              alt="hero template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-center shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="/dashboard2.png"
              alt="feature template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-center shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
           
            
          </div>
        </div>
      ),
    },
    {
      title: "Step 3: AI Begins the Analysis",
      content: (
        <div>
          <p className="mb-4 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            DocuGuard’s engine runs real-time detection on stamps, signatures, fonts, and layout inconsistencies.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/result2.png"
              alt="hero template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-center shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
           
            
          
          </div>
        </div>
      ),
    },{
      title: "Step 4: Instant Results",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            Get a detailed report highlighting suspected forged areas, with confidence scores .
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/result1.png"
              alt="startup template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-center shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="/result3.png"
              alt="startup template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-center shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
           
            
          </div>
        </div>
      ),
    },{
      title: "Step 5: Ongoing Improvements",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            With every scan, DocuGuard learns and improves, making your next detection even more accurate.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/landing.png"
              alt="startup template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-center shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
           
           
            
          </div>
        </div>
      ),
    },
  ];
  return (
    <div>
      <div className=" shadow-xs">
            <Navbar className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
       
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} className="text-white" />
          <div className="flex items-center gap-4">
            <NavbarButton variant="primary" onClick={()=>{router.push('/signin')}}>Login</NavbarButton>
            
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
                Login
              </NavbarButton>
             
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

        </div>
        <div className="flex justify-center mt-36 flex-col items-center">
           <h1 className="text-8xl font-extrabold tracking-tighter ">
               <SparklesText className={"text-8xl font-extrabold tracking-tighter "}><AuroraText>DocuGuard</AuroraText></SparklesText>
           </h1>
         
           <div className="flex flex-row mt-14">
            <div>
              

            </div>
            <div>
                <ShimmerButton className="shadow-2xl" onClick={() => router.push('/signin')}>
      <span className="whitespace-pre-wrap text-center text-md font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10  " >
        Register Now 
      </span>
    </ShimmerButton>

            </div>
              


           </div>
           <div>
             <div className="flex flex-col overflow-hidden ">
      <ContainerScroll
       
      >
        <img
          src={`/dashboard.png`}
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2x  h-full object-center"
          draggable={false}
        />
      </ContainerScroll>
    </div>

           </div>



        </div>

   

        <div >
        
         
          <div className="inset-shadow-sm m-10">
            <div id="contact" className="flex justify-center text-lg font-light pt-5">
              Powered by GenIntel Technologies
            </div>
             <div id="contact" className="flex justify-center text-lg font-light ">
              info@genintel.in
            </div>
            


          </div>

          
          


        </div>


    
     
   
    </div>
  );
}
