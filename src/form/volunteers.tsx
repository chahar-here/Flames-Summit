"use client";
import React, { useState } from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { cn } from "@/lib/utils";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import Loder from "../components/Loder";
import { useRouter } from 'next/navigation';
export function VolunteersForm() {
    const router = useRouter();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    linkedin: "",
    role: "",
    customRole: "",
    whyJoin: "",
    approved:false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading,setLoading]=useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedRole(value);
    setFormData(prev => ({
      ...prev,
      role: value === "other" ? "" : value,
      customRole: ""
    }));
  };

  const handleCustomRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      customRole: value,
      role: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const submissionData = {
        ...formData,
        role: selectedRole === "other" ? formData.customRole : selectedRole,
        timestamp: new Date().toISOString()
      };
      
      // Add a new document with a generated ID
      const docRef = await addDoc(collection(db, "volunteers"), submissionData);
      
      console.log("Document written with ID: ", docRef.id);
      toast.success("Application submitted successfully!");
      
      // Reset form
      setFormData({
        fullname: "",
        email: "",
        phone: "",
        linkedin: "",
        role: "",
        customRole: "",
        whyJoin: "",
        approved: false,
      });
      setSelectedRole("");
      router.push('/success');
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };
  
  if(loading){
    return <Loder/>
  }

  return (
    
    <div className="shadow-input mx-auto w-full max-w-md rounded-none  p-4 md:rounded-2xl md:p-8 dark:bg-black">
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300 text-center">Fill this form to apply for volunteering
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="fullname">Full name</Label>
            <Input 
              id="fullname" 
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Raj Chahar" 
              type="text" 
              required 
            />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
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
          <Label htmlFor="Phone">Phone</Label>
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
          <Label htmlFor="linkedin">Linkedin</Label>
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
          <Label htmlFor="role">Role</Label>
          <Select
            id="role"
            name="role"
            value={selectedRole}
            onChange={handleRoleChange}
            className="flex h-10 w-full rounded-md   px-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-400  disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-neutral-300 dark:placeholder:text-neutral-600"
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
              required={selectedRole === 'other'}
            />
          </LabelInputContainer>
        )}
                <LabelInputContainer className="mb-8">
          <Label htmlFor="whyJoin">Why do you want to join? <span className="text-red-500">*</span></Label>
          <Textarea
            id="whyJoin"
            name="whyJoin"
            value={formData.whyJoin}
            onChange={handleChange}
            placeholder="Tell us why you want to join our team..."
            className="flex h-32 w-full rounded-md  px-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 transition-colors  disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-neutral-300 dark:placeholder:text-neutral-600"
            required
          />
        </LabelInputContainer>

        <button
          className={`group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Submitting...' : 'Submit →'}
          <BottomGradient />
        </button>

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

        <div className="flex flex-col space-y-4">
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
