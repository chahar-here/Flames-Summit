"use client";
import React, { useEffect } from "react";
import VolunteerDashboard from "../components/volunteers";
import { getVolunteers } from "@/lib/actions"; // Ensure this works client-side
import { InteractiveDotBackground } from "@/components/ui/InteractiveDotBackground";

const Page = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getVolunteers();
        console.log("Fetched volunteers:", data);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
        <InteractiveDotBackground/>
      <VolunteerDashboard />
    </div>
  );
};

export default Page;
