// ✅ CONTENT UPDATED FOR CATALYST PROGRAM

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
import { FileUpload } from "@/components/ui/file-upload";
import {
  checkVolunteerUniqueness,
  submitVolunteerForm,
  VolunteerApplicationData,
} from "@/lib/actions";
import { checkCatalystUniqueness, submitCatalystApplication, uploadCatalystFiles } from "@/lib/catalystActions";

export function CatalystForm() {
const [formData, setFormData] = useState({
  fullname: "",
  email: "",
  phone: "",
  linkedin: "",
  xprofile: "",        // NEW → X (Twitter) Profile
  occupation: "",      // NEW → Current Company / Occupation
  experience: "",      // NEW → Professional Experience
});


    const [files, setFiles] = useState<File[]>([]);
  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };
 

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // VALIDATIONS (same as before)
  // -----------------------------
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (phone: string) => {
    const cleaned = phone.replace(/[\s\-]/g, "");
    return /^(\+91)?[6789]\d{9}$/.test(cleaned);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  // -----------------------------
  // SUBMIT
  // -----------------------------
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (isSubmitting) return;
  setIsSubmitting(true);
  setLoading(true);

  try {
    // VALIDATIONS
    if (!isValidEmail(formData.email)) {
      toast.error("Enter a valid email.");
      return;
    }

    if (!isValidPhone(formData.phone)) {
      toast.error("Enter a valid Indian phone number.");
      return;
    }


    // -------------------------------------
    // UNIQUE CHECK
    // -------------------------------------
    const uniqueness = await checkCatalystUniqueness(
      formData.email.trim(),
      formData.phone.trim()
    );

    if (!uniqueness.success) {
      toast.error(uniqueness.message);
      return;
    }

    // -------------------------------------
    // UPLOAD FILES
    // -------------------------------------
    let fileUrls: string[] = [];

    if (files.length > 0) {
      fileUrls = await uploadCatalystFiles(files);
    }

    // -------------------------------------
    // SAVE INTO DATABASE
    // -------------------------------------
    const payload = {
      fullname: formData.fullname.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      linkedin: formData.linkedin.trim(),
      xprofile: formData.xprofile?.trim() || "",
      occupation: formData.occupation?.trim() || "",
      experience: formData.experience?.trim() || "",
      fileUrls,
      submittedAt: new Date().toISOString(),
    };

    const result = await submitCatalystApplication(payload);

    if (result.success) {
      toast.success("Your Catalyst application is submitted!");

      router.push("/becomecatalyst/success");
    } else {
      toast.error("Failed to submit application.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong.");
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
      {/* ----------------------------- */}
      {/* HEADER - UPDATED FOR CATALYST */}
      {/* ----------------------------- */}
      <h1 className="text-3xl md:text-5xl font-bold text-center my-4 text-white">
        Become a{" "}
        <span className="bg-clip-text bg-gradient-to-r text-[#eb0028]">
          Catalyst
        </span>
      </h1>

      <p className="mt-2 max-w-sm text-sm text-neutral-300 text-center">
        Mentor, guide, and accelerate India's next generation of builders at the{" "}
        <span className="text-[#b62129] font-semibold">
          Flames Summit India.
        </span>
      </p>

      <p className="text-center mt-1 text-white">
        Questions?
        <span className="text-[#b62129] font-medium">
          {" "}
          catalyst@flamessummit.org
        </span>
      </p>

      {/* ----------------------------- */}
      {/* FORM */}
      {/* ----------------------------- */}
      <form className="mt-8" onSubmit={handleSubmit}>
        {/* Fullname */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="fullname">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Rahul Verma"
            required
          />
        </LabelInputContainer>

        {/* Email */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="rahul.verma@example.com"
            type="email"
            required
          />
        </LabelInputContainer>

        {/* Phone */}
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

        {/* LinkedIn */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="linkedin">
            LinkedIn Profile <span className="text-red-500">*</span>
          </Label>
          <Input
            id="linkedin"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="https://www.linkedin.com/in/yourprofile/"
            type="url"
            required
          />
        </LabelInputContainer>

                {/* X */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="xprofile">
            X Profile <span className="text-red-500">*</span>
          </Label>
          <Input
            id="xprofile"
            name="xprofile"
            value={formData.xprofile}
            onChange={handleChange}
            placeholder="https://www.X.com/in/yourprofile/"
            type="url"
            required
          />
        </LabelInputContainer>

        {/* Fullname */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="occupation">
            Current Company/Occupation <span className="text-red-500">*</span>
          </Label>
          <Input
            id="occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            placeholder="Flames Summit / Entrepreneur / Investor"
            required
          />
        </LabelInputContainer>

        {/* Why Join */}
        <LabelInputContainer className="mb-8">
          <Label htmlFor="experience">
            Professional Experiance?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Share your professional experience..."
            className="flex h-32 w-full rounded-md bg-zinc-800 text-neutral-300 px-3 py-2"
            required
          />
        </LabelInputContainer>
            <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed  bg-black border-neutral-800 rounded-lg mb-4">
      <FileUpload onChange={handleFileUpload} />
    </div>

        {/* Submit */}
        <button
          className={`group/btn relative block h-10 w-full rounded-md bg-zinc-900 text-white 
          shadow-[0_1px_0_#27272a_inset,0_-1px_0_#27272a_inset] ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Submitting..." : "Submit Application →"}
          <BottomGradient />
        </button>

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent" />
      </form>
    </div>
  );
}

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex w-full flex-col space-y-2", className)}>
    {children}
  </div>
);
