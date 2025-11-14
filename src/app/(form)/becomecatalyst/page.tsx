"use client";
import { InteractiveGridBackgroung } from "@/components/ui/InteractiveGridBackgroung";
import React, { useState } from "react";
import { CatalystForm } from "@/components/form/catalystForm";

const Page = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <InteractiveGridBackgroung />

      {/* -------- MODAL -------- */}
      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black rounded-2xl w-full max-w-xl relative 
                    max-h-[90vh] overflow-y-auto shadow-xl">


            {/* CLOSE BUTTON */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-red-600"
            >
              ✕
            </button>

            {/* FORM INSIDE MODAL */}
            <CatalystForm />
          </div>
        </div>
      )}
      {/* -------- END MODAL -------- */}

      <div className="px-6 md:px-20 py-20 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-7xl font-extrabold text-white leading-[1.1]">
          Become a Flames{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eb0028] to-[#b62129]">
            Catalyst
          </span>{" "}
          <span className="">:</span>
        </h1>

        <h2 className="text-2xl md:text-5xl font-bold text-white mt-3 leading-tight">
          Guide India's Next-Gen Innovators
        </h2>

        <p className="text-xl md:text-2xl text-white font-semibold mt-6 leading-relaxed">
          A revolution as bold as{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eb0028] to-[#b62129]">
            "Build for Bharat"
          </span>{" "}
          needs more than just founders. <br />
          It needs guides, mentors, and leaders. It needs you.
        </p>

        {/* PARAGRAPH */} <p className="text-white text-lg md:text-[18px] mt-8 leading-7 md:leading-8 opacity-90"> Flames Summit India is assembling the largest convergence of entrepreneurial energy the nation has ever seen. Among the 5,000+ founders, we know there will be undiscovered gems, revolutionary ideas, and the future titans of Indian industry. <br /> But vision alone isn't enough. It needs direction. It needs experience. It needs a spark. <br /> We are officially launching the Flames Catalyst Program — a call for India's most accomplished leaders, investors, and experts to serve as mentors for the next generation. This is your invitation to move beyond observation and actively shape the future of Bharat. </p>
        {/* BUTTON */}
        <div className="w-full flex justify-center mt-10">
          <button
            onClick={() => setOpen(true)}
            className="p-[3px] relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#eb0028] to-[#b62129] rounded-lg" />
            <div className="px-8 py-3 bg-black rounded-[6px] relative text-white font-medium group hover:bg-transparent transition duration-200 flex items-center gap-2">
              Apply to be a Catalyst
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M10.75 8.75L14.25 12L10.75 15.25"
                ></path>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
