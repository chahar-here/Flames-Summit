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
import { db, storage } from "../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX, IconMail, IconPhone, IconPlus } from "@tabler/icons-react";
import { LoaderOne } from "@/app/components/ui/loader";

// Define a more specific type for our volunteer objects
type Volunteer = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  photoUrl: string;
  whyVolunteer: string;
  approved?: boolean;
  mobile?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
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
  const [newVolunteer, setNewVolunteer] = useState<{
    fullName: string;
    email: string;
    role: string;
    whyVolunteer: string;
    mobile: string;
    linkedin: string;
    instagram: string;
    twitter: string;
    photoFile?: File | null;
  }>({
    fullName: '',
    email: '',
    role: '',
    whyVolunteer: '',
    mobile: '',
    linkedin: '',
    instagram: '',
    twitter: '',
    photoFile: null,
  });

  // Fetch volunteers with pagination
  const fetchVolunteers = async (initial = false) => {
    setLoading(true);
    try {
      let q = query(collection(db, "volunteer_applications"), orderBy("createdAt", "asc"), limit(8));
      if (!initial && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const newVolunteers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Volunteer));
      
      if (snapshot.docs.length < 8) setHasMore(false);
      if (snapshot.docs.length > 0) setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      
      setVolunteers((prev) => (initial ? newVolunteers : [...prev, ...newVolunteers]));
    } catch (error) {
        console.error("Error fetching volunteers: ", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers(true);
  }, []);

  // --- MODIFIED: Enhanced Delete Function ---
  const handleDelete = async (volunteer: Volunteer) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${volunteer.fullName}? This action cannot be undone.`)) {
      return;
    }
    try {
      if (volunteer.approved) {
        const teamMembersQuery = query(collection(db, "team_members"), where("email", "==", volunteer.email), limit(1));
        const teamMemberSnapshot = await getDocs(teamMembersQuery);
        const batch = writeBatch(db);

        if (!teamMemberSnapshot.empty) {
          const teamMemberDocRef = doc(db, "team_members", teamMemberSnapshot.docs[0].id);
          batch.delete(teamMemberDocRef);
        }
        
        const applicationDocRef = doc(db, "volunteer_applications", volunteer.id);
        batch.delete(applicationDocRef);
        await batch.commit();
      } else {
        await deleteDoc(doc(db, "volunteer_applications", volunteer.id));
      }
      setVolunteers((prev) => prev.filter((v) => v.id !== volunteer.id));
    } catch (error) {
      console.error("Error deleting volunteer:", error);
      alert("Failed to delete volunteer.");
    }
  };

  // --- NEW: Unapprove Function ---
  const handleUnapprove = async (volunteer: Volunteer) => {
    if (!window.confirm(`This will remove ${volunteer.fullName} from the public team list and mark their application as pending. Continue?`)) {
      return;
    }
    try {
      const teamMembersQuery = query(collection(db, "team_members"), where("email", "==", volunteer.email), limit(1));
      const teamMemberSnapshot = await getDocs(teamMembersQuery);
      const batch = writeBatch(db);

      if (!teamMemberSnapshot.empty) {
        const teamMemberDocRef = doc(db, "team_members", teamMemberSnapshot.docs[0].id);
        batch.delete(teamMemberDocRef);
      }

      const applicationDocRef = doc(db, "volunteer_applications", volunteer.id);
      batch.update(applicationDocRef, { approved: false });
      await batch.commit();

      setVolunteers((prev) =>
        prev.map((v) => (v.id === volunteer.id ? { ...v, approved: false } : v))
      );
    } catch (error) {
      console.error("Error unapproving volunteer:", error);
      alert("Failed to unapprove volunteer.");
    }
  };

  // Approve a volunteer and add them to the official team
  const handleApprove = async (volunteer: Volunteer) => {
    try {
        const volunteerRef = doc(db, "volunteer_applications", volunteer.id);
        await updateDoc(volunteerRef, { approved: true });
        
        const teamMemberData = { ...volunteer, approved: true, teamJoinDate: Timestamp.now() } as Omit<Volunteer, "id"> & { id?: string };
        delete teamMemberData.id;

        await addDoc(collection(db, "team_members"), teamMemberData);
        
        setVolunteers((prev) =>
          prev.map((v) => (v.id === volunteer.id ? { ...v, approved: true } : v))
        );
    } catch (error) {
        console.error("Error approving volunteer:", error);
        alert("Failed to approve volunteer.");
    }
  };

  // Handle the submission of the edit form
  const handleEditSubmit = async () => {
    if (!editVolunteer) return;
    const { id, photoFile, ...rest } = editVolunteer;
    let updatedData: Partial<Volunteer> = { ...rest };

    setLoading(true);
    try {
      if (photoFile) {
        const photoRef = ref(storage, `volunteer_photos/${Date.now()}_${(photoFile as File).name}`);
        await uploadBytes(photoRef, photoFile as Blob);
        const photoUrl = await getDownloadURL(photoRef);
        updatedData.photoUrl = photoUrl;
      }

      await updateDoc(doc(db, "volunteer_applications", id), updatedData);
      setVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, ...updatedData } : v)));
      setEditVolunteer(null);
    } catch (error) {
        console.error("Error updating volunteer: ", error);
        alert("Failed to update volunteer.");
    } finally {
        setLoading(false);
    }
  };

  const handleAddVolunteer = async () => {
    const { fullName, email, role, whyVolunteer, photoFile } = newVolunteer;
    if (!fullName || !email || !role || !whyVolunteer || !photoFile) {
        alert("Please fill all required fields and upload a photo.");
        return;
    }
    try {
        setLoading(true);
        const photoRef = ref(storage, `volunteer_photos/${Date.now()}_${photoFile.name}`);
        await uploadBytes(photoRef, photoFile);
        const photoUrl = await getDownloadURL(photoRef);

        const docData = {
            ...newVolunteer,
            photoUrl,
            approved: false,
            createdAt: Timestamp.now(),
            guidelinesAccepted: true,
        };
        delete docData.photoFile;

        const docRef = await addDoc(collection(db, "volunteer_applications"), docData);
        setVolunteers(prev => [{ id: docRef.id, ...docData }, ...prev]);
        setNewVolunteer({ fullName: '', email: '', role: '', whyVolunteer: '', mobile: '', linkedin: '', instagram: '', twitter: '', photoFile: null });
        setIsAddModalOpen(false);
    } catch (error) {
        console.error("Error adding new volunteer:", error);
        alert("Failed to add new volunteer.");
    } finally {
        setLoading(false);
    }
  };

  // Filter volunteers based on search and filter state
  const filteredVolunteers = volunteers.filter((v) => {
    const matchSearch = v.fullName.toLowerCase().includes(search.toLowerCase()) ||
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
          <input
            type="text"
            placeholder="Search by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-md w-full md:w-64"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
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
          <LoaderOne/>
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVolunteers.map((volunteer) => (
            <div
              key={volunteer.id}
              className="bg-white rounded-2xl flex flex-col shadow-md border hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={volunteer.photoUrl || 'https://placehold.co/400x400/e0e0e0/757575?text=No+Image'}
                  alt={volunteer.fullName}
                  layout="fill"
                  className="object-cover"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/e0e0e0/757575?text=Error'; }}
                />
                 <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded-full ${volunteer.approved ? 'bg-green-600' : 'bg-yellow-600'}`}>
                    {volunteer.approved ? 'Approved' : 'Pending'}
                </div>
              </div>
        
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold text-gray-800">{volunteer.fullName}</h2>
                <p className="text-sm font-medium text-[#E62B1E] mb-2">{volunteer.role}</p>
                <p className="text-xs text-gray-500 italic mb-4 flex-grow">"{volunteer.whyVolunteer}"</p>
                
                <div className="flex items-center justify-center gap-4 text-gray-500 mb-4 border-t pt-4">
                    {volunteer.linkedin && <a href={volunteer.linkedin} target="_blank" rel="noopener noreferrer"><IconBrandLinkedin className="hover:text-blue-700" /></a>}
                    {volunteer.twitter && <a href={volunteer.twitter} target="_blank" rel="noopener noreferrer"><IconBrandX className="hover:text-black" /></a>}
                    {volunteer.instagram && <a href={volunteer.instagram} target="_blank" rel="noopener noreferrer"><IconBrandInstagram className="hover:text-pink-500" /></a>}
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-auto">
                  {volunteer.approved ? (
                    <button onClick={() => handleUnapprove(volunteer)} className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600">Unapprove</button>
                  ) : (
                    <button onClick={() => handleApprove(volunteer)} className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700">Approve</button>
                  )}
                  <button onClick={() => setEditVolunteer(volunteer)} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">Edit</button>
                  <button onClick={() => handleDelete(volunteer)} className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <button onClick={() => fetchVolunteers()} className="bg-black text-white px-4 py-2 rounded-lg shadow hover:bg-gray-800 transition-colors">Load More</button>
        </div>
      )}

       {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-lg w-full shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Add New Volunteer</h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <input className="w-full border px-3 py-2 rounded" placeholder="Full Name *" value={newVolunteer.fullName} onChange={(e) => setNewVolunteer({ ...newVolunteer, fullName: e.target.value })}/>
              <input type="email" className="w-full border px-3 py-2 rounded" placeholder="Email *" value={newVolunteer.email} onChange={(e) => setNewVolunteer({ ...newVolunteer, email: e.target.value })}/>
              <input className="w-full border px-3 py-2 rounded" placeholder="Role *" value={newVolunteer.role} onChange={(e) => setNewVolunteer({ ...newVolunteer, role: e.target.value })}/>
              <textarea className="w-full border px-3 py-2 rounded" placeholder="Why do they want to volunteer? *" value={newVolunteer.whyVolunteer} onChange={(e) => setNewVolunteer({ ...newVolunteer, whyVolunteer: e.target.value })}/>
              <input type="tel" className="w-full border px-3 py-2 rounded" placeholder="Phone" value={newVolunteer.mobile} onChange={(e) => setNewVolunteer({ ...newVolunteer, mobile: e.target.value })}/>
              <input type="url" className="w-full border px-3 py-2 rounded" placeholder="LinkedIn URL" value={newVolunteer.linkedin} onChange={(e) => setNewVolunteer({ ...newVolunteer, linkedin: e.target.value })}/>
              <input type="url" className="w-full border px-3 py-2 rounded" placeholder="Instagram URL" value={newVolunteer.instagram} onChange={(e) => setNewVolunteer({ ...newVolunteer, instagram: e.target.value })}/>
              <input type="url" className="w-full border px-3 py-2 rounded" placeholder="X (Twitter) URL" value={newVolunteer.twitter} onChange={(e) => setNewVolunteer({ ...newVolunteer, twitter: e.target.value })}/>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volunteer Photo *</label>
                <input type="file" accept="image/*" className="w-full text-sm" onChange={(e) => setNewVolunteer({ ...newVolunteer, photoFile: e.target.files ? e.target.files[0] : null })}/>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button className="bg-neutral-600 text-white px-4 py-2 rounded hover:bg-neutral-700" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleAddVolunteer}>Add Volunteer</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editVolunteer && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-lg w-full shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Edit Volunteer Application</h2>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              <input className="w-full border px-3 py-2 rounded" value={editVolunteer.fullName} onChange={(e) => setEditVolunteer({ ...editVolunteer, fullName: e.target.value })} placeholder="Full Name"/>
              <input className="w-full border px-3 py-2 rounded" value={editVolunteer.email} onChange={(e) => setEditVolunteer({ ...editVolunteer, email: e.target.value })} placeholder="Email"/>
              <input className="w-full border px-3 py-2 rounded" value={editVolunteer.mobile} onChange={(e) => setEditVolunteer({ ...editVolunteer, mobile: e.target.value })} placeholder="Phone"/>
              <input className="w-full border px-3 py-2 rounded" value={editVolunteer.role} onChange={(e) => setEditVolunteer({ ...editVolunteer, role: e.target.value })} placeholder="Role"/>
              <textarea className="w-full border px-3 py-2 rounded min-h-[100px]" value={editVolunteer.whyVolunteer} onChange={(e) => setEditVolunteer({ ...editVolunteer, whyVolunteer: e.target.value })} placeholder="Why they want to volunteer"/>
              <input className="w-full border px-3 py-2 rounded" value={editVolunteer.linkedin} onChange={(e) => setEditVolunteer({ ...editVolunteer, linkedin: e.target.value })} placeholder="LinkedIn URL"/>
              <input className="w-full border px-3 py-2 rounded" value={editVolunteer.instagram} onChange={(e) => setEditVolunteer({ ...editVolunteer, instagram: e.target.value })} placeholder="Instagram URL"/>
              <input className="w-full border px-3 py-2 rounded" value={editVolunteer.twitter} onChange={(e) => setEditVolunteer({ ...editVolunteer, twitter: e.target.value })} placeholder="X (Twitter) URL"/>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Photo</label>
                <input type="file" accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" onChange={(e) => setEditVolunteer({ ...editVolunteer, photoFile: e.target.files?.[0] })}/>
                {editVolunteer.photoUrl && !editVolunteer.photoFile && (
                        <img src={editVolunteer.photoUrl} alt="Current photo" className="w-24 h-24 object-contain mt-2 p-2 border rounded"/>
                    )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="bg-neutral-600 text-white px-4 py-2 rounded hover:bg-neutral-700" onClick={() => setEditVolunteer(null)}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleEditSubmit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
