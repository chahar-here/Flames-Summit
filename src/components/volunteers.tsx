"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  addDoc,
  where,
  limit,
  startAfter,
  writeBatch,
  Timestamp,
  orderBy
} from "firebase/firestore";
import AnimatedList from './AnimatedList'
import { db } from "@/lib/firebase";
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX, IconMail, IconPhone, IconPlus } from "@tabler/icons-react";
import {LoaderOne} from "@/components/ui/loader";
import { getVolunteers, submitVolunteerForm, updateVolunteer, deleteVolunteer, approveVolunteer, unapproveVolunteer } from "@/lib/actions";
import { VolunteersForm } from "@/components/form/volunteersedit";
import { toast } from "sonner";
import Image from "next/image";
// Define a more specific type for our volunteer objects
type Volunteer = {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  linkedin: string;
  role: string;
  customRole: string;
  whyJoin: string;
  approved: boolean;
  [key: string]: any; // Allow other properties
};

export default function VolunteerDashboard() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editVolunteer, setEditVolunteer] = useState<Volunteer | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [newVolunteer, setNewVolunteer] = useState<{
    fullname: string;
    email: string;
    phone: string;
    linkedin: string;
    role: string;
    customRole: string;
    whyJoin: string;
    approved: boolean;
  }>({
    fullname: "",
    email: "",
    phone: "",
    linkedin: "",
    role: "",
    customRole: "",
    whyJoin: "",
    approved: false,
  });

  // Fetch volunteers
  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await getVolunteers(100); // Get first 100 volunteers
      setVolunteers(data);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      alert("Failed to fetch volunteers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);


  // Handle delete volunteer
  const handleDelete = async (volunteer: Volunteer) => {
    if (!window.confirm(`Are you sure you want to delete ${volunteer.fullname}?`)) {
      return;
    }
    try {
      const result = await deleteVolunteer(volunteer.id);
      if (result.success) {
        setVolunteers(prev => prev.filter(v => v.id !== volunteer.id));
      } else {
        throw new Error(result.error || 'Failed to delete volunteer');
      }
    } catch (error) {
      console.error("Error deleting volunteer:", error);
      alert(error instanceof Error ? error.message : "Failed to delete volunteer");
    }
  };

  // Handle approve/unapprove volunteer
  const handleApproveToggle = async (volunteer: Volunteer) => {
    try {
      let result;
      if (volunteer.approved) {
        result = await unapproveVolunteer(volunteer.id);
      } else {
        result = await approveVolunteer(volunteer.id);
      }

      if (result.success) {
        setVolunteers(prev =>
          prev.map(v =>
            v.id === volunteer.id
              ? { ...v, approved: !volunteer.approved }
              : v
          )
        );
      } else {
        throw new Error(result.error || 'Failed to update volunteer status');
      }
    } catch (error) {
      console.error("Error updating volunteer status:", error);
      alert(error instanceof Error ? error.message : "Failed to update volunteer status");
    }
  };

  // Handle edit volunteer
  const handleEditSubmit = async (formData: any) => {
    if (!editVolunteer) return;

    try {
      const result = await updateVolunteer(editVolunteer.id, {
        ...formData,
        approved: editVolunteer.approved // Preserve approval status
      });

      if (result.success) {
        setVolunteers(prev =>
          prev.map(v =>
            v.id === editVolunteer.id
              ? { ...v, ...formData }
              : v
          )
        );
        setEditVolunteer(null);
        toast.success("Volunteer updated successfully!");
      } else {
        throw new Error(result.error || 'Failed to update volunteer');
      }
    } catch (error) {
      console.error("Error updating volunteer:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update volunteer");
    }
  };

  // Handle add new volunteer
  const handleAddVolunteer = async (formData: any) => {
    try {
      const result = await submitVolunteerForm({
        ...formData,
        approved: false
      });

      if (result.success) {
        await fetchVolunteers(); // Refresh the list
        setIsAddModalOpen(false);
        toast.success("Volunteer added successfully!");
      } else {
        throw new Error(result.error || 'Failed to add volunteer');
      }
    } catch (error) {
      console.error("Error adding volunteer:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add volunteer");
    }
  };

  // Filter volunteers based on search and filter state
  const filteredVolunteers = volunteers.filter((v) => {
    const matchSearch = v.fullname.toLowerCase().includes(search.toLowerCase()) ||
      v.role?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" || (filter === "approved" && v.approved) || (filter === "pending" && !v.approved);
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-4 md:p-8">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#E62B1E]">Volunteer Applications</h1>
        <div className="flex gap-2">
          <div className="flex justify-end">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-l-md ${viewMode === "grid" ? "bg-red-600 text-white" : "bg-gray-200 text-black"}`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-r-md ${viewMode === "list" ? "bg-red-600 text-white" : "bg-gray-200 text-black"}`}
            >
              List View
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-md w-full md:w-64 text-white"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-white"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-md hover:bg-gray-300">
            <IconPlus size={16} />
            New
          </button>
        </div>
      </div>

      {/* Volunteer Grid */}
      {loading && volunteers.length === 0 ? (
        <div className="h-screen flex items-center justify-center">
          <LoaderOne />
        </div>
      ) : viewMode === "grid" ? (
        // 🟦 GRID VIEW
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVolunteers.map((volunteer) => (
            <div
              key={volunteer.id}
              className="bg-black rounded-2xl flex flex-col shadow-md border hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-48 w-full">
                <Image
                  src="/flames_white.png"
                  alt="flames-logo"
                  layout="fill"
                  className="object-cover"
                />
                <div
                  className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded-full ${volunteer.approved ? "bg-green-600" : "bg-yellow-600"
                    }`}
                >
                  {volunteer.approved ? "Approved" : "Pending"}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold text-white">{volunteer.fullname}</h2>
                <p className="text-sm font-medium text-[#E62B1E] mb-2">{volunteer.role}</p>
                <p className="text-xs text-white italic mb-4 flex-grow">
                  "{volunteer.whyJoin}"
                </p>
                <div className="flex items-center justify-center gap-4 text-gray-500 mb-4 border-t pt-4">
                  {volunteer.linkedin && (
                    <a
                      href={volunteer.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconBrandLinkedin className="hover:text-blue-700" />
                    </a>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-auto">
                  <button
                    onClick={() => handleApproveToggle(volunteer)}
                    className={`px-3 py-1 rounded-md text-sm text-white ${volunteer.approved
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-green-600 hover:bg-green-700"
                      }`}
                  >
                    {volunteer.approved ? "Unapprove" : "Approve"}
                  </button>
                  <button
                    onClick={() => setEditVolunteer(volunteer)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(volunteer)}
                    className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 🟩 LIST VIEW
<div className="w-full overflow-x-auto">
  <div className="min-w-[800px] grid grid-cols-6 gap-4 bg-[#111] text-white font-semibold text-sm rounded-t-xl p-3 border-b border-gray-700">
    <div>Full Name</div>
    <div>Role</div>
    <div>Email</div>
    <div>Phone</div>
    <div>LinkedIn</div>
    <div className="text-center">Operations</div>
  </div>

  {/* Table Rows */}
<AnimatedList
  items={volunteers}
  onItemSelect={(item, index) => console.log(item, index)}
  showGradients={true}
  enableArrowNavigation={true}
  displayScrollbar={true}
  handleDelete={handleDelete}
  handleApproveToggle={handleApproveToggle}
  setEditVolunteer={setEditVolunteer}
/>
</div>

      )}


      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => fetchVolunteers()}
            className="bg-black text-white px-4 py-2 rounded-lg shadow hover:bg-gray-800 transition-colors"
          >
            Load More
          </button>
        </div>
      )}

      {/* Add Volunteer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Volunteer</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <VolunteersForm
                onSubmit={handleAddVolunteer}
                initialData={{
                  fullname: "",
                  email: "",
                  phone: "",
                  linkedin: "",
                  role: "",
                  customRole: "",
                  whyJoin: ""
                }}
                submitButtonText="Add Volunteer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editVolunteer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-black rounded-lg border border-gray-700 p-6 w-full max-w-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Edit Volunteer</h2>
              <button
                onClick={() => setEditVolunteer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <VolunteersForm
                onSubmit={handleEditSubmit}
                initialData={{
                  fullname: editVolunteer.fullname,
                  email: editVolunteer.email,
                  phone: editVolunteer.phone,
                  linkedin: editVolunteer.linkedin || "",
                  role: editVolunteer.role,
                  customRole: editVolunteer.customRole || "",
                  whyJoin: editVolunteer.whyJoin
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
