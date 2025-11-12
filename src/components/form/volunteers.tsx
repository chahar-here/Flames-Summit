"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LoaderOne } from "@/components/ui/loader";
import { useRouter } from "next/navigation";

import {
  checkVolunteerUniqueness,
  submitVolunteerForm,
  VolunteerApplicationData,
} from "@/lib/actions";

export function VolunteersForm() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    linkedin: "",
    role: "",
    customRole: "",
    whyJoin: "",
  });
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fixed email validation
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ✅ Fixed phone validation - now more flexible
  const isValidPhone = (phone: string) => {
    // Remove spaces and dashes for validation
    const cleaned = phone.replace(/[\s\-]/g, '');
    // Match Indian numbers: optional +91, then 10 digits starting with 6-9
    return /^(\+91)?[6789]\d{9}$/.test(cleaned);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedRole(value);
    setFormData((prev) => ({
      ...prev,
      role: value === "other" ? "" : value,
      customRole: "",
    }));
  };

  const handleCustomRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      customRole: value,
      role: value,
    }));
  };

  // ✅ Fixed submit handler with proper error handling
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) {
      console.log("Already submitting, ignoring...");
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      // Step 1: Validate email format
      if (!isValidEmail(formData.email)) {
        toast.error("Please enter a valid email address.");
        return;
      }

      // Step 2: Validate phone format
      if (!isValidPhone(formData.phone)) {
        toast.error("Please enter a valid Indian phone number (e.g., +91 9876543210 or 9876543210)");
        return;
      }

      // Step 3: Validate role
      const finalRole = selectedRole === "other" ? formData.customRole.trim() : selectedRole;
      
      if (!finalRole) {
        toast.error("Please select or enter a role.");
        return;
      }

      // Step 4: Check uniqueness from Firestore
      console.log("Checking uniqueness...");
      const uniqueness = await checkVolunteerUniqueness(
        formData.email.trim(),
        formData.phone.trim()
      );

      if (!uniqueness.success) {
        toast.error(uniqueness.message || "This email or phone is already registered.");
        return;
      }

      // Step 5: Prepare application data
      const applicationData: VolunteerApplicationData = {
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        linkedin: formData.linkedin.trim(),
        role: finalRole,
        customRole: formData.customRole.trim(),
        whyJoin: formData.whyJoin.trim(),
        approved: false,
      };

      // Step 6: Submit to server
      console.log("Submitting form...");
      const result = await submitVolunteerForm(applicationData);

      if (result.success) {
        toast.success(result.message || "Application submitted successfully!");
        
        // Reset form
        setFormData({
          fullname: "",
          email: "",
          phone: "",
          linkedin: "",
          role: "",
          customRole: "",
          whyJoin: "",
        });
        setSelectedRole("");
        
        // Navigate to success page
        router.push("/callforvolunteers/success");
      } else {
        toast.error(result.error || "Failed to submit application. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <LoaderOne />
      </div>
    );
  }

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none p-4 md:rounded-2xl md:p-8 bg-black/80">
      <h1 className="text-3xl text-white md:text-5xl font-bold tracking-tight text-center my-4">
        Call for{" "}
        <span className="bg-clip-text bg-gradient-to-r text-[#eb0028]">
          Volunteers
        </span>
      </h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-300 text-center">
        Join the
        <span className="text-[#b62129] font-semibold"> Flames Summit India </span>
        Volunteer Team and be part of something meaningful.
      </p>
      <p className="text-center mt-1 text-white">
        Questions?
        <span className="text-[#b62129] font-medium"> info@flamessummit.org</span>
      </p>

      <form className="mt-8" onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="fullname">
              Full name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Stanley Ipkiss"
              type="text"
              required
            />
          </LabelInputContainer>
        </div>
        
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="projectmayhem@fc.com"
            type="email"
            required
          />
        </LabelInputContainer>
        
        <LabelInputContainer className="mb-4">
          <Label htmlFor="phone">
            Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
            type="tel"
            required
          />
        </LabelInputContainer>
        
        <LabelInputContainer className="mb-4">
          <Label htmlFor="linkedin">
            LinkedIn <span className="text-red-500">*</span>
          </Label>
          <Input
            id="linkedin"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="https://www.linkedin.com/in/xxxxxx/"
            type="url"
            required
          />
        </LabelInputContainer>
        
        <LabelInputContainer className="mb-4">
          <Label htmlFor="role">
            Role <span className="text-red-500">*</span>
          </Label>
          <Select
            id="role"
            name="role"
            value={selectedRole}
            onChange={handleRoleChange}
            className="flex h-10 w-full rounded-md px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 bg-zinc-800 text-neutral-300 placeholder:text-neutral-600"
            required
          >
            <option value="">Select your role</option>
            <option value="graphic-designer">Graphic Designer</option>
            <option value="web-developer">Web Developer</option>
            <option value="outreaching-team">Outreaching Team</option>
            <option value="video-editor">Video Editor</option>
            <option value="content-writer">Content Writer</option>
            <option value="curator">Curator</option>
            <option value="other">Other</option>
          </Select>
        </LabelInputContainer>
        
        {selectedRole === "other" && (
          <LabelInputContainer className="mb-8">
            <Label htmlFor="customRole">Please specify your role</Label>
            <Input
              id="customRole"
              placeholder="Enter your role"
              type="text"
              value={formData.customRole}
              onChange={handleCustomRoleChange}
              required={selectedRole === "other"}
            />
          </LabelInputContainer>
        )}
        
        <LabelInputContainer className="mb-8">
          <Label htmlFor="whyJoin">
            Why do you want to join? <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="whyJoin"
            name="whyJoin"
            value={formData.whyJoin}
            onChange={handleChange}
            placeholder="Tell us why you want to join our team..."
            className="flex h-32 w-full rounded-md px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 bg-zinc-800 text-neutral-300 placeholder:text-neutral-600"
            required
          />
        </LabelInputContainer>

        <button
          className={`group/btn relative block h-10 w-full rounded-md bg-gradient-to-br font-medium text-white bg-zinc-800 from-zinc-900 to-zinc-900 shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Submitting..." : "Submit →"}
          <BottomGradient />
        </button>
        
        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent dark:via-[#E62B1E]/80" />
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};