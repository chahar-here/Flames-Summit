"use client";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Loder from "../Loder";
import { useRouter } from "next/navigation";

// --- MODIFIED IMPORTS ---
// We import the server action and its data type
import {
  submitVolunteerForm,
  VolunteerApplicationData,
} from "@/lib/actions";
// We no longer need client-side 'db', 'addDoc', or 'collection'
// ---

interface VolunteersFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: {
    fullname: string;
    email: string;
    phone: string;
    linkedin: string;
    role: string;
    customRole: string;
    whyJoin: string;
  };
  submitButtonText?: string;
}

export function VolunteersForm({ 
  onSubmit, 
  initialData, 
  submitButtonText = 'Submit' 
}: VolunteersFormProps) {
  const [formData, setFormData] = useState({
    fullname: initialData?.fullname || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    linkedin: initialData?.linkedin || "",
    role: initialData?.role || "",
    customRole: initialData?.customRole || "",
    whyJoin: initialData?.whyJoin || "",
  });
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  // This logic remains the same
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // This logic remains the same
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedRole(value);
    setFormData((prev) => ({
      ...prev,
      role: value === "other" ? "" : value,
      customRole: "",
    }));
  };

  // This logic remains the same
  const handleCustomRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      customRole: value,
      role: value, // This seems to be your logic, it's fine
    }));
  };

  // --- MODIFIED SUBMIT HANDLER ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (isSubmitting) return;
    setIsSubmitting(true);

    // 1. Create the clean data object to send to the server
    const finalRole =
      selectedRole === "other" ? formData.customRole : selectedRole;

    const applicationData: VolunteerApplicationData = {
      fullname: formData.fullname,
      email: formData.email,
      phone: formData.phone,
      linkedin: formData.linkedin,
      role: finalRole,
      customRole: formData.customRole, // Add customRole
      whyJoin: formData.whyJoin,
      approved: false // Default to false for new applications
    };

    try {
      // Call the provided onSubmit handler
      await onSubmit(applicationData);
      
      // Reset form if this is not an edit form
      if (!initialData) {
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
      }
    } catch (error) {
      console.error("Error submitting form: ", error);
      toast.error("An unexpected error occurred. Please try again.");
            setLoading(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- END OF MODIFIED HANDLER ---

  if (loading) {
    return <Loder />;
  }

  // --- All JSX below this line is IDENTICAL to your original file ---
  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none p-4 md:rounded-2xl md:p-8 bg-black/80">

      <form className="mt-8" onSubmit={handleSubmit}>
        <div className="space-y-4">
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="fullname">Full name <span className="text-red-500">*</span></Label>
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
          <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
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
          <Label htmlFor="Phone">Phone <span className="text-red-500">*</span></Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 xxxxxxxxxx"
            type="tel"
            required
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="linkedin">Linkedin <span className="text-red-500">*</span></Label>
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
          <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
          <Select
            id="role"
            name="role"
            value={selectedRole}
            onChange={handleRoleChange}
            className="flex h-10 w-full rounded-md   px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 bg-zinc-800 text-neutral-300 placeholder:text-neutral-600"
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
            className="flex h-32 w-full rounded-md  px-3 py-2 text-sm transition-colors  disabled:cursor-not-allowed disabled:opacity-50 bg-zinc-800 text-neutral-300 placeholder:text-neutral-600"
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

        <div className="flex flex-col space-y-4"></div>

        </div>
      </form>
    </div>
  );
}
const BottomGradient = () => {
  return (
    <>
      {/* Sharp underline */}
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      {/* Blurred glowing underline */}
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