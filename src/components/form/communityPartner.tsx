// communitypartner.tsx/
"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LoaderOne } from "@/components/ui/loader"; // Assuming you have this
import { useRouter } from "next/navigation";
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX, IconLoader2 } from "@tabler/icons-react";

// Import the new server action
import { submitCommunityPartnerForm, CommunityPartnerData } from "@/lib/actions";

export default function CommunityPartner() {
  const [formData, setFormData] = useState<CommunityPartnerData>({
    orgName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    reason: "",
  });
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoading(true);

    try {
      const result = await submitCommunityPartnerForm(formData);

      if (result.success) {
        toast.success(result.message || "Application submitted successfully!");
        // Redirect to a 'success' page, just like your volunteer form
        router.push("/partner-with-us/success"); 

        // Reset form
        setFormData({
          orgName: "", contactName: "", email: "",
          phone: "", website: "", reason: ""
        });
      } else {
        toast.error(result.error || "Failed to submit application.");
      }
    } catch (error) {
      console.error("Error submitting form: ", error);
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
    <div className="flex items-center justify-center min-h-screen w-full px-4 py-20">
      <div className="shadow-input mx-auto w-full max-w-md rounded-none p-4 md:rounded-2xl md:p-8 bg-black/80">
        <h1 className="text-3xl text-white md:text-5xl font-bold tracking-tight text-center my-4">
          Partner With{" "}
          <span className=" bg-clip-text bg-gradient-to-r text-[#eb0028]">
            Us
          </span>
        </h1>
        <p className="mt-2 max-w-sm text-sm text-neutral-300 text-center">
          Join us as a Community Partner and let's build this summit
          <span className="text-[#b62129] font-semibold"> together</span>.
        </p>
        <p className="text-center mt-1 text-white">
          Questions?
          <span className="text-[#b62129] font-medium"> info@flamessummit.org</span>
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="orgName">Organization Name <span className="text-red-500">*</span></Label>
            <Input
              id="orgName" name="orgName" value={formData.orgName}
              onChange={handleChange} placeholder="Your Community / Org" type="text" required
            />
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="contactName">Contact Person <span className="text-red-500">*</span></Label>
            <Input
              id="contactName" name="contactName" value={formData.contactName}
              onChange={handleChange} placeholder="Stanley Ipkiss" type="text" required
            />
          </LabelInputContainer>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer className="w-full">
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="you@organization.com" type="email" required
              />
            </LabelInputContainer>
            <LabelInputContainer className="w-full">
              <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
              <Input
                id="phone" name="phone" value={formData.phone}
                onChange={handleChange} placeholder="+91 xxxxxxxxxx" type="tel" required
              />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="website">Website / LinkedIn <span className="text-red-500">*</span></Label>
            <Input
              id="website" name="website" value={formData.website}
              onChange={handleChange} placeholder="https://your-org.com" type="url" required
            />
          </LabelInputContainer>

          <LabelInputContainer className="mb-8">
            <Label htmlFor="reason">
              Why do you want to partner? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason" name="reason" value={formData.reason}
              onChange={handleChange}
              placeholder="Tell us about your community and why you'd be a great fit..."
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
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <IconLoader2 size={18} className="animate-spin" />
                <span className="ml-2">Submitting...</span>
              </div>
            ) : "Submit →"}
            <BottomGradient />
          </button>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent dark:via-[#E62B1E]/80" />
        </form>

        <div className="flex items-center justify-center mt-6 space-x-10">
          <a href="https://x.com/flamessummit" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition">
            <IconBrandX size={30} />
          </a>
          <a href="https://www.linkedin.com/company/flamessummitindia" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition">
            <IconBrandLinkedin size={30} />
          </a>
          <a href="https://www.instagram.com/flamessummitindia" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition">
            <IconBrandInstagram size={32} />
          </a>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components (copied from your form) ---

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