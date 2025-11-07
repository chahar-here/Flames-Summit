"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  addDoc,
  limit,
  startAfter,
  Timestamp,
  where,
  writeBatch
} from "firebase/firestore";
import { db, storage } from "../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { IconUser, IconMail, IconPhone, IconPlus } from "@tabler/icons-react";
import { LoaderOne } from "@/app/components/ui/loader";

type PartnerRequest = {
  id: string;
  brand: string;
  fullName: string;
  email: string;
  budget: string;
  branddes: string;
  mobile: string;
  linkedin?: string;
  socialmedia?: string;
  deadline: string;
  message?: string;
  approved?: boolean;
  logoUrl?: string;
  [key: string]: any;
};

export default function PartnerDashboard() {
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRequest, setEditRequest] = useState<PartnerRequest | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState<{
    brand: string;
    fullName: string;
    email: string;
    budget: string;
    branddes: string;
    mobile: string;
    linkedin?: string;
    socialmedia?: string;
    deadline: string;
    message?: string;
    logoFile?: File | null;
  }>({
    brand: '',
    fullName: '',
    email: '',
    budget: '',
    branddes: '',
    mobile: '',
    linkedin: '',
    socialmedia: '',
    deadline: '',
    message: '',
    logoFile: null,
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchRequests = async (initial = false) => {
    setLoading(true);
    try {
      let q = query(collection(db, "partner_requests"), orderBy("createdAt", "asc"), limit(8));
      if (!initial && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }
      const snapshot = await getDocs(q);
      const newRequests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PartnerRequest));
      if (snapshot.docs.length < 8) setHasMore(false);
      if (snapshot.docs.length > 0) setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setRequests((prev) => (initial ? newRequests : [...prev, ...newRequests]));
    } catch (error) {
        console.error("Error fetching partner requests: ", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(true);
  }, []);

  const handleDelete = async (request: PartnerRequest) => {
    if (!window.confirm(`Are you sure you want to permanently delete the request from ${request.brand}?`)) return;
    try {
        const batch = writeBatch(db);
        if (request.approved) {
            const partnersQuery = query(collection(db, "partners"), where("email", "==", request.email), limit(1));
            const partnerSnapshot = await getDocs(partnersQuery);
            if (!partnerSnapshot.empty) {
                batch.delete(doc(db, "partners", partnerSnapshot.docs[0].id));
            }
        }
        batch.delete(doc(db, "partner_requests", request.id));
        await batch.commit();
        setRequests((prev) => prev.filter((r) => r.id !== request.id));
    } catch (error) {
        console.error("Error deleting request:", error);
        alert("Failed to delete request.");
    }
  };

  const handleUnapprove = async (request: PartnerRequest) => {
    if (!window.confirm(`This will unapprove ${request.brand}. Continue?`)) return;
    try {
        const batch = writeBatch(db);
        const partnersQuery = query(collection(db, "partners"), where("email", "==", request.email), limit(1));
        const partnerSnapshot = await getDocs(partnersQuery);
        if (!partnerSnapshot.empty) {
            batch.delete(doc(db, "partners", partnerSnapshot.docs[0].id));
        }
        batch.update(doc(db, "partner_requests", request.id), { approved: false });
        await batch.commit();
        setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, approved: false } : r)));
    } catch (error) {
        console.error("Error unapproving partner:", error);
        alert("Failed to unapprove partner.");
    }
  };

  const handleApprove = async (request: PartnerRequest) => {
    try {
        const batch = writeBatch(db);
        batch.update(doc(db, "partner_requests", request.id), { approved: true });
        const { id, ...partnerData } = { ...request, approved: true, partnershipDate: Timestamp.now() };
        batch.set(doc(collection(db, "partners")), partnerData);
        await batch.commit();
        setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, approved: true } : r)));
    } catch (error) {
        console.error("Error approving partner: ", error);
        alert("Failed to approve partner.");
    }
  };

  const handleEditSubmit = async () => {
    if (!editRequest) return;
    const { id, logoFile, ...rest } = editRequest;
    let updatedData: Partial<PartnerRequest> = { ...rest };
    try {
      if (logoFile) {
        const logoRef = ref(storage, `partner_logos/${Date.now()}_${(logoFile as File).name}`);
        await uploadBytes(logoRef, logoFile as Blob);
        updatedData.logoUrl = await getDownloadURL(logoRef);
      }
      const batch = writeBatch(db);
      batch.update(doc(db, "partner_requests", id), updatedData);
      if(editRequest.approved) {
        const partnersQuery = query(collection(db, "partners"), where("email", "==", editRequest.email), limit(1));
        const partnerSnapshot = await getDocs(partnersQuery);
        if (!partnerSnapshot.empty) {
            batch.update(doc(db, "partners", partnerSnapshot.docs[0].id), updatedData);
        }
      }
      await batch.commit();
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...updatedData } : r)));
      setEditRequest(null);
    } catch (error) {
        console.error("Error updating partner request: ", error);
        alert("Failed to update partner details.");
    }
  };

  const handleAddPartner = async () => {
    const { brand, fullName, email, budget, branddes, mobile, logoFile } = newPartner;
    if (!brand || !fullName || !email || !budget || !branddes || !mobile || !logoFile) {
        alert("Please fill all required fields and upload a logo.");
        return;
    }
    try {
        setLoading(true);
        const logoRef = ref(storage, `partner_logos/${Date.now()}_${logoFile.name}`);
        await uploadBytes(logoRef, logoFile);
        const logoUrl = await getDownloadURL(logoRef);

        const docData = {
            ...newPartner,
            logoUrl,
            approved: false,
            createdAt: Timestamp.now(),
            guidelinesAccepted: true,
        };
        delete docData.logoFile;

        const docRef = await addDoc(collection(db, "partner_requests"), docData);
        setRequests(prev => [{ id: docRef.id, ...docData }, ...prev]);
        setNewPartner({ brand: '', fullName: '', email: '', budget: '', branddes: '', mobile: '', linkedin: '', socialmedia: '', deadline: '', message: '', logoFile: null });
        setIsAddModalOpen(false);
    } catch (error) {
        console.error("Error adding new partner:", error);
        alert("Failed to add new partner.");
    } finally {
        setLoading(false);
    }
  };
  
  const filteredRequests = requests.filter((r) => {
    const searchTerm = search.toLowerCase();
    const matchSearch = r.brand.toLowerCase().includes(searchTerm) || r.fullName.toLowerCase().includes(searchTerm);
    const matchFilter = filter === 'all' || (filter === 'approved' && r.approved) || (filter === 'pending' && !r.approved);
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#E62B1E]">Partnership Requests</h1>
        <div className="flex gap-2">
          <input type="text" placeholder="Search by brand or name..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border rounded-md w-full md:w-64"/>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border rounded-md">
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

      {loading && requests.length === 0 ? (
        <div className="h-screen flex items-center justify-center"><LoaderOne/></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-2xl flex flex-col shadow-md border hover:shadow-lg transition-all duration-300 relative">
              <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded-full ${request.approved ? 'bg-green-600' : 'bg-yellow-600'}`}>
                  {request.approved ? 'Approved' : 'Pending'}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                {request.logoUrl && (<img src={request.logoUrl} alt={`${request.brand} logo`} className="w-full h-24 object-contain mb-4 rounded"/>)}
                <h2 className="text-lg font-semibold text-gray-800 mb-1 mt-2">{request.brand}</h2>
                <p className="text-sm text-gray-500 mb-3">Budget: <span className="font-medium text-gray-700">{request.budget}</span></p>
                <div className="text-sm text-gray-600 space-y-2 mb-4 border-t pt-3">
                    <p className="flex items-center gap-2"><IconUser size={14} /> {request.fullName}</p>
                    <p className="flex items-center gap-2"><IconMail size={14} /> {request.email}</p>
                    <p className="flex items-center gap-2"><IconPhone size={14} /> {request.mobile}</p>
                </div>
                <div className="mt-auto flex justify-end gap-2">
                  {request.approved ? (
                    <button onClick={() => handleUnapprove(request)} className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600">Unapprove</button>
                  ) : (
                    <button onClick={() => handleApprove(request)} className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700">Approve</button>
                  )}
                  <button onClick={() => setEditRequest(request)} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">Edit</button>
                  <button onClick={() => handleDelete(request)} className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && !loading && (<div className="flex justify-center mt-8"><button onClick={() => fetchRequests()} className="bg-black text-white px-4 py-2 rounded-lg shadow hover:bg-gray-800">Load More</button></div>)}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-lg w-full shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Add New Partner</h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <input className="w-full border px-3 py-2 rounded" placeholder="Brand Name *" value={newPartner.brand} onChange={(e) => setNewPartner({ ...newPartner, brand: e.target.value })}/>
                <input className="w-full border px-3 py-2 rounded" placeholder="Contact Full Name *" value={newPartner.fullName} onChange={(e) => setNewPartner({ ...newPartner, fullName: e.target.value })}/>
                <input type="email" className="w-full border px-3 py-2 rounded" placeholder="Email *" value={newPartner.email} onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}/>
                <input className="w-full border px-3 py-2 rounded" placeholder="Budget *" value={newPartner.budget} onChange={(e) => setNewPartner({ ...newPartner, budget: e.target.value })}/>
                <textarea className="w-full border px-3 py-2 rounded" placeholder="Brand Description *" value={newPartner.branddes} onChange={(e) => setNewPartner({ ...newPartner, branddes: e.target.value })}/>
                <input type="tel" className="w-full border px-3 py-2 rounded" placeholder="Phone *" value={newPartner.mobile} onChange={(e) => setNewPartner({ ...newPartner, mobile: e.target.value })}/>
                <input type="url" className="w-full border px-3 py-2 rounded" placeholder="LinkedIn URL" value={newPartner.linkedin} onChange={(e) => setNewPartner({ ...newPartner, linkedin: e.target.value })}/>
                <input type="url" className="w-full border px-3 py-2 rounded" placeholder="Other Social Media URL" value={newPartner.socialmedia} onChange={(e) => setNewPartner({ ...newPartner, socialmedia: e.target.value })}/>
                <input className="w-full border px-3 py-2 rounded" placeholder="Deadline *" value={newPartner.deadline} onChange={(e) => setNewPartner({ ...newPartner, deadline: e.target.value })}/>
                <textarea className="w-full border px-3 py-2 rounded" placeholder="Additional Message" value={newPartner.message} onChange={(e) => setNewPartner({ ...newPartner, message: e.target.value })}/>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partner Logo *</label>
                  <input type="file" accept="image/*" className="w-full text-sm" onChange={(e) => setNewPartner({ ...newPartner, logoFile: e.target.files ? e.target.files[0] : null })}/>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button className="bg-neutral-600 text-white px-4 py-2 rounded hover:bg-neutral-700" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleAddPartner}>Add Partner</button>
            </div>
          </div>
        </div>
      )}

      {editRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-2xl w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#E62B1E]">Edit: {editRequest.brand}</h2>
                <button onClick={() => setEditRequest(null)} className="text-2xl font-bold">&times;</button>
            </div>
            <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Brand Name</label><input type="text" value={editRequest.brand} onChange={(e) => setEditRequest({...editRequest, brand: e.target.value})} className="w-full border px-3 py-2 rounded mt-1"/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Contact Name</label><input type="text" value={editRequest.fullName} onChange={(e) => setEditRequest({...editRequest, fullName: e.target.value})} className="w-full border px-3 py-2 rounded mt-1"/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" value={editRequest.email} onChange={(e) => setEditRequest({...editRequest, email: e.target.value})} className="w-full border px-3 py-2 rounded mt-1"/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Phone</label><input type="tel" value={editRequest.mobile} onChange={(e) => setEditRequest({...editRequest, mobile: e.target.value})} className="w-full border px-3 py-2 rounded mt-1"/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Budget</label><input type="text" value={editRequest.budget} onChange={(e) => setEditRequest({...editRequest, budget: e.target.value})} className="w-full border px-3 py-2 rounded mt-1"/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Deadline</label><input type="text" value={editRequest.deadline} onChange={(e) => setEditRequest({...editRequest, deadline: e.target.value})} className="w-full border px-3 py-2 rounded mt-1"/></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700">Brand Description</label><textarea value={editRequest.branddes} onChange={(e) => setEditRequest({...editRequest, branddes: e.target.value})} className="w-full border px-3 py-2 rounded mt-1 min-h-[100px]"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Social Media</label><input type="text" value={editRequest.socialmedia || ''} onChange={(e) => setEditRequest({...editRequest, socialmedia: e.target.value})} className="w-full border px-3 py-2 rounded mt-1"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Additional Message</label><textarea value={editRequest.message || ''} onChange={(e) => setEditRequest({...editRequest, message: e.target.value})} className="w-full border px-3 py-2 rounded mt-1 min-h-[80px]"/></div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Update Logo</label>
                    <input type="file" accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" onChange={(e) => setEditRequest({ ...editRequest, logoFile: e.target.files?.[0] })}/>
                    {editRequest.logoUrl && !editRequest.logoFile && (<img src={editRequest.logoUrl} alt="Current logo" className="w-24 h-24 object-contain mt-2 p-2 border rounded"/>)}
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="bg-neutral-600 text-white px-4 py-2 rounded hover:bg-neutral-700" onClick={() => setEditRequest(null)}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleEditSubmit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
