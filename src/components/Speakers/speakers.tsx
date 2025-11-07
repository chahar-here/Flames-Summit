// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   collection,
//   deleteDoc,
//   doc,
//   getDocs,
//   query,
//   updateDoc,
//   addDoc,
//   where,
//   limit,
//   startAfter,
//   writeBatch,
//   orderBy,
//   Timestamp
// } from "firebase/firestore";
// import { db, storage } from "../../../lib/firebase";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import Image from "next/image";
// import { IconBrandInstagram, IconBrandLinkedin, IconBrandX, IconPlus } from "@tabler/icons-react";
// import { LoaderOne } from "@/app/components/ui/loader";

// // Define a more specific type for our speaker objects
// type Speaker = {
//   id?: string;
//   fullName: string;
//   email: string;
//   topic: string;
//   photoUrl: string;
//   approved?: boolean;
//   mobile?: string;
//   twitter?: string;
//   linkedin?: string;
//   instagram?: string;
//   [key: string]: any; // Allow other properties
// };

// export default function SpeakerDashboard() {
//   const [speakers, setSpeakers] = useState<Speaker[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editSpeaker, setEditSpeaker] = useState<Speaker | null>(null);
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [lastVisible, setLastVisible] = useState<any>(null);
//   const [hasMore, setHasMore] = useState(true);
//   // --- NEW: State for the 'Add Speaker' modal ---
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [newSpeaker, setNewSpeaker] = useState({
//     fullName: '',
//     email: '',
//     topic: '',
//     mobile: '',
//     linkedin: '',
//     instagram: '',
//     twitter: '',
//     photoFile: null as File | null,
//   });

//   const fetchSpeakers = async (initial = false) => {
//     setLoading(true);
//     const q = query(collection(db, "speaker_nominations"), orderBy("createdAt", "asc"), limit(20));
    
//     const snapshot = await getDocs(q);
//     const newSpeakers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Speaker));
    
//     if (snapshot.docs.length < 10) setHasMore(false);
//     if (snapshot.docs.length > 0) setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    
//     setSpeakers(initial ? newSpeakers : [...speakers, ...newSpeakers]);
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchSpeakers(true);
//   }, []);

//   const handleDelete = async (speaker: Speaker) => {
//     if (!window.confirm(`Are you sure you want to permanently delete ${speaker.fullName}? This action cannot be undone.`)) {
//       return;
//     }
//     try {
//       if (speaker.approved) {
//         const speakersQuery = query(collection(db, "speakers"), where("email", "==", speaker.email), limit(1));
//         const speakerSnapshot = await getDocs(speakersQuery);
//         const batch = writeBatch(db);
//         if (!speakerSnapshot.empty) {
//           batch.delete(doc(db, "speakers", speakerSnapshot.docs[0].id));
//         }
//         if (speaker.id) {
//           batch.delete(doc(db, "speaker_nominations", speaker.id));
//         } else {
//           throw new Error("Speaker ID is undefined.");
//         }
//         await batch.commit();
//       } else {
//         if (!speaker.id) {
//           throw new Error("Speaker ID is undefined.");
//         }
//         await deleteDoc(doc(db, "speaker_nominations", speaker.id));
//       }
//       setSpeakers((prev) => prev.filter((s) => s.id !== speaker.id));
//     } catch (error) {
//       console.error("Error deleting speaker:", error);
//       alert("Failed to delete speaker. Please try again.");
//     }
//   };

//   const handleUnapprove = async (speaker: Speaker) => {
//     if (!window.confirm(`This will remove ${speaker.fullName} from the public speakers list and mark them as pending. Continue?`)) {
//       return;
//     }
//     try {
//       const speakersQuery = query(collection(db, "speakers"), where("email", "==", speaker.email), limit(1));
//       const speakerSnapshot = await getDocs(speakersQuery);
//       const batch = writeBatch(db);
//       if (!speakerSnapshot.empty) {
//         batch.delete(doc(db, "speakers", speakerSnapshot.docs[0].id));
//       }
//       if (!speaker.id) {
//         throw new Error("Speaker ID is undefined.");
//       }
//       batch.update(doc(db, "speaker_nominations", speaker.id), { approved: false });
//       await batch.commit();
//       setSpeakers((prev) =>
//         prev.map((s) => (s.id === speaker.id ? { ...s, approved: false } : s))
//       );
//     } catch (error) {
//       console.error("Error unapproving speaker:", error);
//       alert("Failed to unapprove speaker. Please try again.");
//     }
//   };

//   const handleApprove = async (speaker: Speaker) => {
//     try {
//         if (!speaker.id) {
//           throw new Error("Speaker ID is undefined.");
//         }
//         const speakerRef = doc(db, "speaker_nominations", speaker.id);
//         await updateDoc(speakerRef, { approved: true });
//         const speakerData = { ...speaker, approved: true };
//         delete speakerData.id;
//         await addDoc(collection(db, "speakers"), speakerData);
//         setSpeakers((prev) =>
//           prev.map((s) => (s.id === speaker.id ? { ...s, approved: true } : s))
//         );
//     } catch (error) {
//         console.error("Error approving speaker:", error);
//         alert("Failed to approve speaker.");
//     }
//   };

//   // --- MODIFIED: Enhanced Edit Function ---
//   const handleEdit = async () => {
//     if (!editSpeaker) return;
//     const { id, photoFile, ...rest } = editSpeaker;
//     let updatedData: Partial<Speaker> = { ...rest };

//     try {
//         if (photoFile) {
//             const photoRef = ref(storage, `speaker_photos/${Date.now()}_${(photoFile as File).name}`);
//             await uploadBytes(photoRef, photoFile as Blob);
//             const photoUrl = await getDownloadURL(photoRef);
//             updatedData.photoUrl = photoUrl;
//         }

//         const batch = writeBatch(db);

//         // Update the document in 'speaker_nominations'
//         if (!id) {
//           throw new Error("Speaker ID is undefined.");
//         }
//         const nominationRef = doc(db, "speaker_nominations", id);
//         batch.update(nominationRef, updatedData);

//         // If the speaker is already approved, also update the 'speakers' collection
//         if (editSpeaker.approved) {
//             const speakersQuery = query(collection(db, "speakers"), where("email", "==", editSpeaker.email), limit(1));
//             const speakerSnapshot = await getDocs(speakersQuery);
//             if (!speakerSnapshot.empty) {
//                 const publicSpeakerRef = doc(db, "speakers", speakerSnapshot.docs[0].id);
//                 batch.update(publicSpeakerRef, updatedData);
//             }
//         }

//         await batch.commit();

//         setSpeakers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
//         setEditSpeaker(null);

//     } catch (error) {
//         console.error("Error updating speaker:", error);
//         alert("Failed to update speaker details.");
//     }
//   };
//   const handleAddSpeaker = async () => {
//     const { fullName, email, topic, photoFile } = newSpeaker;
//     if (!fullName || !email || !topic || !photoFile) {
//         alert("Please fill in Full Name, Email, Topic, and upload a photo.");
//         return;
//     }
//     try {
//         setLoading(true);
//         // Upload photo
//         const photoRef = ref(storage, `speaker_photos/${Date.now()}_${photoFile.name}`);
//         await uploadBytes(photoRef, photoFile);
//         const photoUrl = await getDownloadURL(photoRef);

//         // Add to 'speaker_nominations'
//         const docData = {
//             ...newSpeaker,
//             photoUrl,
//             approved: false,
//             createdAt: Timestamp.now(),
//             guidelinesAccepted: true, // Assuming manual adds accept guidelines
//         } as Omit<typeof newSpeaker, "photoFile"> & { photoFile?: File | null };
//         delete docData.photoFile;

//         const docRef = await addDoc(collection(db, "speaker_nominations"), docData);

//         // Add to local state to update UI immediately
//         setSpeakers(prev => [
//           {
//             id: docRef.id,
//             fullName: newSpeaker.fullName,
//             email: newSpeaker.email,
//             topic: newSpeaker.topic,
//             photoUrl,
//             approved: false,
//             mobile: newSpeaker.mobile,
//             twitter: newSpeaker.twitter,
//             linkedin: newSpeaker.linkedin,
//             instagram: newSpeaker.instagram,
//           },
//           ...prev
//         ]);
        
//         // Reset form and close modal
//         setNewSpeaker({ fullName: '', email: '', topic: '', mobile: '', linkedin: '', instagram: '', twitter: '', photoFile: null });
//         setIsAddModalOpen(false);
//     } catch (error) {
//         console.error("Error adding new speaker:", error);
//         alert("Failed to add new speaker.");
//     } finally {
//         setLoading(false);
//     }
//   };

//   const filteredSpeakers = speakers.filter((s) => {
//     const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
//       s.topic?.toLowerCase().includes(search.toLowerCase());
//     const matchFilter =
//       filter === "all" || (filter === "approved" && s.approved) || (filter === "pending" && !s.approved);
//     return matchSearch && matchFilter;
//   });

//   return (
//     <div className="p-4 md:p-8">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//         <h1 className="text-2xl font-bold text-[#E62B1E]">Speaker Nominations</h1>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             placeholder="Search name/topic..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="px-3 py-2 border rounded-md w-full md:w-64"
//           />
//           <select
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             className="px-3 py-2 border rounded-md"
//           >
//             <option value="all">All</option>
//             <option value="approved">Approved</option>
//             <option value="pending">Pending</option>
//           </select>
//           {/* --- NEW: Add Speaker Button --- */}
//           <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-md hover:bg-gray-300">
//             <IconPlus size={16} />
//             New
//           </button>
//         </div>
//       </div>
//       {loading && speakers.length === 0 ? (
//               <div className="h-screen flex items-center justify-center">
//                 <LoaderOne/>
//                 </div>
//             ) : (
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {filteredSpeakers.map((speaker) => (
//           <div
//             key={speaker.id}
//             className="bg-white rounded-2xl flex flex-col shadow-md border hover:shadow-lg transition-all duration-300 overflow-hidden"
//           >
//             <div className="relative w-full h-60">
//               <Image
//                 src={speaker.photoUrl}
//                 alt={speaker.fullName}
//                 layout="fill"
//                 className="object-cover"
//               />
//             </div>
      
//             <div className="p-4 flex flex-col flex-grow">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-lg font-semibold text-gray-800">{speaker.fullName}</h2>
//                 <div className="flex gap-2 text-gray-500">
//                   {speaker.twitter && (<a href={speaker.twitter} target="_blank" rel="noopener noreferrer"><IconBrandX className="hover:text-black" /></a>)}
//                   {speaker.linkedin && (<a href={speaker.linkedin} target="_blank" rel="noopener noreferrer"><IconBrandLinkedin className="hover:text-blue-700" /></a>)}
//                   {speaker.instagram && (<a href={speaker.instagram} target="_blank" rel="noopener noreferrer"><IconBrandInstagram className="hover:text-pink-500" /></a>)}
//                 </div>
//               </div>
      
//               <div className="text-sm text-gray-600 mt-2">
//                 <p><span className="font-medium text-gray-700">Topic:</span> {speaker.topic}</p>
//                 <p>
//                   Status:{" "}
//                   {speaker.approved ? (
//                     <span className="text-green-600 font-semibold">Approved</span>
//                   ) : (
//                     <span className="text-yellow-600 font-semibold">Pending</span>
//                   )}
//                 </p>
//               </div>
              
//             <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
//               {speaker.approved ? (
//                 <button onClick={() => handleUnapprove(speaker)} className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600">Unapprove</button>
//               ) : (
//                 <button onClick={() => handleApprove(speaker)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Approve</button>
//               )}
//               <button onClick={() => setEditSpeaker(speaker)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Edit</button>
//               <button onClick={() => handleDelete(speaker)} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Delete</button>
//             </div>
      
//             </div>
//           </div>
//         ))}
//       </div>
//             )}

//       {/* {hasMore && !loading && (
//         <div className="flex justify-center mt-6">
//           <button onClick={() => fetchSpeakers()} className="bg-black text-white px-4 py-2 rounded shadow">Load More</button>
//         </div>
//       )} */}

//       {/* --- NEW: Add Speaker Modal --- */}
//       {isAddModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-lg w-full shadow-xl">
//             <h2 className="text-xl font-semibold mb-4">Add New Speaker</h2>
//             <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
//               <input className="w-full border px-3 py-2 rounded" placeholder="Full Name *" value={newSpeaker.fullName} onChange={(e) => setNewSpeaker({ ...newSpeaker, fullName: e.target.value })}/>
//               <input type="email" className="w-full border px-3 py-2 rounded" placeholder="Email *" value={newSpeaker.email} onChange={(e) => setNewSpeaker({ ...newSpeaker, email: e.target.value })}/>
//               <input className="w-full border px-3 py-2 rounded" placeholder="Talk Topic *" value={newSpeaker.topic} onChange={(e) => setNewSpeaker({ ...newSpeaker, topic: e.target.value })}/>
//               <input type="tel" className="w-full border px-3 py-2 rounded" placeholder="Phone" value={newSpeaker.mobile} onChange={(e) => setNewSpeaker({ ...newSpeaker, mobile: e.target.value })}/>
//               <input type="url" className="w-full border px-3 py-2 rounded" placeholder="LinkedIn URL" value={newSpeaker.linkedin} onChange={(e) => setNewSpeaker({ ...newSpeaker, linkedin: e.target.value })}/>
//               <input type="url" className="w-full border px-3 py-2 rounded" placeholder="Instagram URL *" required value={newSpeaker.instagram} onChange={(e) => setNewSpeaker({ ...newSpeaker, instagram: e.target.value })}/>
//               <input type="url" className="w-full border px-3 py-2 rounded" placeholder="X (Twitter) URL" value={newSpeaker.twitter} onChange={(e) => setNewSpeaker({ ...newSpeaker, twitter: e.target.value })}/>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Photo *</label>
//                 <input type="file" accept="image/*" className="w-full text-sm" onChange={(e) => setNewSpeaker({ ...newSpeaker, photoFile: e.target.files ? e.target.files[0] : null })}/>
//               </div>
//             </div>
//             <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
//               <button className="bg-neutral-600 text-white px-4 py-2 rounded hover:bg-neutral-700" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
//               <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleAddSpeaker}>Add Speaker</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* --- UPDATED EDIT MODAL --- */}
//       {editSpeaker && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-lg w-full shadow-xl">
//             <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold">Edit Speaker: {editSpeaker.fullName}</h2>
//                 <button onClick={() => setEditSpeaker(null)} className="text-2xl font-bold">&times;</button>
//             </div>
            
//             <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Full Name</label>
//                 <input className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.fullName} onChange={(e) => setEditSpeaker({ ...editSpeaker, fullName: e.target.value })}/>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Email</label>
//                 <input type="email" className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.email} onChange={(e) => setEditSpeaker({ ...editSpeaker, email: e.target.value })}/>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Phone</label>
//                 <input type="tel" className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.mobile || ''} onChange={(e) => setEditSpeaker({ ...editSpeaker, mobile: e.target.value })}/>
//               </div>
//                <div>
//                 <label className="block text-sm font-medium text-gray-700">Talk Topic</label>
//                 <input className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.topic} onChange={(e) => setEditSpeaker({ ...editSpeaker, topic: e.target.value })}/>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
//                 <input type="url" className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.linkedin || ''} onChange={(e) => setEditSpeaker({ ...editSpeaker, linkedin: e.target.value })}/>
//               </div>
//                <div>
//                 <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
//                 <input type="url" className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.instagram || ''} onChange={(e) => setEditSpeaker({ ...editSpeaker, instagram: e.target.value })}/>
//               </div>
//                <div>
//                 <label className="block text-sm font-medium text-gray-700">X (Twitter) URL</label>
//                 <input type="url" className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.twitter || ''} onChange={(e) => setEditSpeaker({ ...editSpeaker, twitter: e.target.value })}/>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Update Photo</label>
//                 <input type="file" accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" onChange={(e) => setEditSpeaker({ ...editSpeaker, photoFile: e.target.files?.[0] })}/>
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
//               <button className="bg-neutral-600 text-white px-4 py-2 rounded hover:bg-neutral-700" onClick={() => setEditSpeaker(null)}>Cancel</button>
//               <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleEdit}>Save Changes</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
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
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db, storage } from "../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX, IconPlus } from "@tabler/icons-react";
import { LoaderOne } from "@/app/components/ui/loader";

// ✅ MODIFIED: Added createdAt to the type for clarity
type Speaker = {
  id?: string;
  fullName: string;
  email: string;
  topic: string;
  photoUrl: string;
  approved?: boolean;
  mobile?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  createdAt?: Timestamp; // Added for type safety
  [key: string]: any; // Allow other properties
};

export default function SpeakerDashboard() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSpeaker, setEditSpeaker] = useState<Speaker | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSpeaker, setNewSpeaker] = useState({
    fullName: '',
    email: '',
    topic: '',
    mobile: '',
    linkedin: '',
    instagram: '',
    twitter: '',
    photoFile: null as File | null,
  });

  const fetchSpeakers = async (initial = false) => {
    setLoading(true);
    const q = query(collection(db, "speaker_nominations"), orderBy("createdAt", "desc"), limit(20));
    
    const snapshot = await getDocs(q);
    const newSpeakers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Speaker));
    
    if (snapshot.docs.length < 10) setHasMore(false);
    if (snapshot.docs.length > 0) setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    
    setSpeakers(initial ? newSpeakers : [...speakers, ...newSpeakers]);
    setLoading(false);
  };

  useEffect(() => {
    fetchSpeakers(true);
  }, []);

  const handleDelete = async (speaker: Speaker) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${speaker.fullName}? This action cannot be undone.`)) return;
    try {
      if (speaker.approved) {
        const speakersQuery = query(collection(db, "speakers"), where("email", "==", speaker.email), limit(1));
        const speakerSnapshot = await getDocs(speakersQuery);
        const batch = writeBatch(db);
        if (!speakerSnapshot.empty) {
          batch.delete(doc(db, "speakers", speakerSnapshot.docs[0].id));
        }
        if (!speaker.id) throw new Error("Speaker ID is undefined.");
        batch.delete(doc(db, "speaker_nominations", speaker.id));
        await batch.commit();
      } else {
        if (!speaker.id) throw new Error("Speaker ID is undefined.");
        await deleteDoc(doc(db, "speaker_nominations", speaker.id));
      }
      setSpeakers((prev) => prev.filter((s) => s.id !== speaker.id));
    } catch (error) {
      console.error("Error deleting speaker:", error);
      alert("Failed to delete speaker. Please try again.");
    }
  };

  const handleUnapprove = async (speaker: Speaker) => {
    if (!window.confirm(`This will remove ${speaker.fullName} from the public speakers list and mark them as pending. Continue?`)) return;
    try {
      const speakersQuery = query(collection(db, "speakers"), where("email", "==", speaker.email), limit(1));
      const speakerSnapshot = await getDocs(speakersQuery);
      const batch = writeBatch(db);
      if (!speakerSnapshot.empty) {
        batch.delete(doc(db, "speakers", speakerSnapshot.docs[0].id));
      }
      if (!speaker.id) throw new Error("Speaker ID is undefined.");
      batch.update(doc(db, "speaker_nominations", speaker.id), { approved: false });
      await batch.commit();
      setSpeakers((prev) =>
        prev.map((s) => (s.id === speaker.id ? { ...s, approved: false } : s))
      );
    } catch (error) {
      console.error("Error unapproving speaker:", error);
      alert("Failed to unapprove speaker. Please try again.");
    }
  };

  const handleApprove = async (speaker: Speaker) => {
    try {
        if (!speaker.id) throw new Error("Speaker ID is undefined.");
        
        // Use a batch to ensure atomicity
        const batch = writeBatch(db);
        const speakerNominationRef = doc(db, "speaker_nominations", speaker.id);
        batch.update(speakerNominationRef, { approved: true });

        // Prepare data for the public 'speakers' collection
        const publicSpeakerData = { ...speaker, approved: true };
        delete publicSpeakerData.id; // Remove the nomination-specific ID

        // Crucially, ensure createdAt exists before adding
        if (!publicSpeakerData.createdAt) {
          publicSpeakerData.createdAt = Timestamp.now();
        }
        
        const speakersCollectionRef = collection(db, "speakers");
        batch.set(doc(speakersCollectionRef), publicSpeakerData); // Use set to be explicit

        await batch.commit();
        
        setSpeakers((prev) =>
          prev.map((s) => (s.id === speaker.id ? { ...s, approved: true } : s))
        );
    } catch (error) {
        console.error("Error approving speaker:", error);
        alert("Failed to approve speaker.");
    }
  };

  const handleEdit = async () => {
    if (!editSpeaker) return;
    const { id, photoFile, ...rest } = editSpeaker;
    let updatedData: Partial<Speaker> = { ...rest };

    try {
        if (photoFile) {
            const photoRef = ref(storage, `speaker_photos/${Date.now()}_${(photoFile as File).name}`);
            await uploadBytes(photoRef, photoFile as Blob);
            updatedData.photoUrl = await getDownloadURL(photoRef);
        }

        const batch = writeBatch(db);
        if (!id) throw new Error("Speaker ID is undefined.");
        const nominationRef = doc(db, "speaker_nominations", id);
        batch.update(nominationRef, updatedData);

        if (editSpeaker.approved) {
            const speakersQuery = query(collection(db, "speakers"), where("email", "==", editSpeaker.email), limit(1));
            const speakerSnapshot = await getDocs(speakersQuery);
            if (!speakerSnapshot.empty) {
                const publicSpeakerRef = doc(db, "speakers", speakerSnapshot.docs[0].id);
                batch.update(publicSpeakerRef, updatedData);
            }
        }

        await batch.commit();

        setSpeakers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
        setEditSpeaker(null);

    } catch (error) {
        console.error("Error updating speaker:", error);
        alert("Failed to update speaker details.");
    }
  };

  const handleAddSpeaker = async () => {
    const { fullName, email, topic, photoFile } = newSpeaker;
    if (!fullName || !email || !topic || !photoFile) {
        alert("Please fill in Full Name, Email, Topic, and upload a photo.");
        return;
    }
    try {
        setLoading(true);
        const photoRef = ref(storage, `speaker_photos/${Date.now()}_${photoFile.name}`);
        await uploadBytes(photoRef, photoFile);
        const photoUrl = await getDownloadURL(photoRef);
        
        // ✅ FIX: Create the timestamp ONCE and use it for both database and local state.
        const creationTime = Timestamp.now();

        const docData = {
            ...newSpeaker,
            photoUrl,
            approved: false,
            createdAt: creationTime, // Use the timestamp here
            guidelinesAccepted: true,
        };
        // Can't use 'as' assertion here if photoFile is to be removed.
        const { photoFile: removedFile, ...dataToSave } = docData;

        const docRef = await addDoc(collection(db, "speaker_nominations"), dataToSave);

        // ✅ FIX: Add the new speaker to the local state WITH the createdAt timestamp.
        setSpeakers(prev => [
          {
            id: docRef.id,
            fullName: newSpeaker.fullName,
            email: newSpeaker.email,
            topic: newSpeaker.topic,
            photoUrl,
            approved: false,
            mobile: newSpeaker.mobile,
            twitter: newSpeaker.twitter,
            linkedin: newSpeaker.linkedin,
            instagram: newSpeaker.instagram,
            createdAt: creationTime, // Include the timestamp in the local state
          },
          ...prev
        ]);
        
        setNewSpeaker({ fullName: '', email: '', topic: '', mobile: '', linkedin: '', instagram: '', twitter: '', photoFile: null });
        setIsAddModalOpen(false);
    } catch (error) {
        console.error("Error adding new speaker:", error);
        alert("Failed to add new speaker.");
    } finally {
        setLoading(false);
    }
  };

  const filteredSpeakers = speakers.filter((s) => {
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.topic?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" || (filter === "approved" && s.approved) || (filter === "pending" && !s.approved);
    return matchSearch && matchFilter;
  });

  return (
    // ... your existing JSX remains the same ...
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#E62B1E]">Speaker Nominations</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search name/topic..."
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
      {loading && speakers.length === 0 ? (
              <div className="h-screen flex items-center justify-center">
                <LoaderOne/>
                </div>
            ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredSpeakers.map((speaker) => (
          <div
            key={speaker.id}
            className="bg-white rounded-2xl flex flex-col shadow-md border hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="relative w-full h-60">
              <Image
                src={speaker.photoUrl}
                alt={speaker.fullName}
                layout="fill"
                className="object-cover"
              />
            </div>
      
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">{speaker.fullName}</h2>
                <div className="flex gap-2 text-gray-500">
                  {speaker.twitter && (<a href={speaker.twitter} target="_blank" rel="noopener noreferrer"><IconBrandX className="hover:text-black" /></a>)}
                  {speaker.linkedin && (<a href={speaker.linkedin} target="_blank" rel="noopener noreferrer"><IconBrandLinkedin className="hover:text-blue-700" /></a>)}
                  {speaker.instagram && (<a href={speaker.instagram} target="_blank" rel="noopener noreferrer"><IconBrandInstagram className="hover:text-pink-500" /></a>)}
                </div>
              </div>
      
              <div className="text-sm text-gray-600 mt-2">
                <p><span className="font-medium text-gray-700">Topic:</span> {speaker.topic}</p>
                <p>
                  Status:{" "}
                  {speaker.approved ? (
                    <span className="text-green-600 font-semibold">Approved</span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">Pending</span>
                  )}
                </p>
              </div>
              
            <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
              {speaker.approved ? (
                <button onClick={() => handleUnapprove(speaker)} className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600">Unapprove</button>
              ) : (
                <button onClick={() => handleApprove(speaker)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Approve</button>
              )}
              <button onClick={() => setEditSpeaker(speaker)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Edit</button>
              <button onClick={() => handleDelete(speaker)} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Delete</button>
            </div>
      
            </div>
          </div>
        ))}
      </div>
            )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-lg w-full shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Add New Speaker</h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <input className="w-full border px-3 py-2 rounded" placeholder="Full Name *" value={newSpeaker.fullName} onChange={(e) => setNewSpeaker({ ...newSpeaker, fullName: e.target.value })}/>
              <input type="email" className="w-full border px-3 py-2 rounded" placeholder="Email *" value={newSpeaker.email} onChange={(e) => setNewSpeaker({ ...newSpeaker, email: e.target.value })}/>
              <input className="w-full border px-3 py-2 rounded" placeholder="Talk Topic *" value={newSpeaker.topic} onChange={(e) => setNewSpeaker({ ...newSpeaker, topic: e.target.value })}/>
              <input type="tel" className="w-full border px-3 py-2 rounded" placeholder="Phone" value={newSpeaker.mobile} onChange={(e) => setNewSpeaker({ ...newSpeaker, mobile: e.target.value })}/>
              <input type="url" className="w-full border px-3 py-2 rounded" placeholder="LinkedIn URL" value={newSpeaker.linkedin} onChange={(e) => setNewSpeaker({ ...newSpeaker, linkedin: e.target.value })}/>
              <input type="url" className="w-full border px-3 py-2 rounded" placeholder="Instagram URL *" required value={newSpeaker.instagram} onChange={(e) => setNewSpeaker({ ...newSpeaker, instagram: e.target.value })}/>
              <input type="url" className="w-full border px-3 py-2 rounded" placeholder="X (Twitter) URL" value={newSpeaker.twitter} onChange={(e) => setNewSpeaker({ ...newSpeaker, twitter: e.target.value })}/>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Photo *</label>
                <input type="file" accept="image/*" className="w-full text-sm" onChange={(e) => setNewSpeaker({ ...newSpeaker, photoFile: e.target.files ? e.target.files[0] : null })}/>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button className="bg-neutral-600 text-white px-4 py-2 rounded hover:bg-neutral-700" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleAddSpeaker}>Add Speaker</button>
            </div>
          </div>
        </div>
      )}

      {editSpeaker && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-lg w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Speaker: {editSpeaker.fullName}</h2>
                <button onClick={() => setEditSpeaker(null)} className="text-2xl font-bold">&times;</button>
            </div>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.fullName} onChange={(e) => setEditSpeaker({ ...editSpeaker, fullName: e.target.value })}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.email} onChange={(e) => setEditSpeaker({ ...editSpeaker, email: e.target.value })}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.mobile || ''} onChange={(e) => setEditSpeaker({ ...editSpeaker, mobile: e.target.value })}/>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Talk Topic</label>
                <input className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.topic} onChange={(e) => setEditSpeaker({ ...editSpeaker, topic: e.target.value })}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                <input type="url" className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.linkedin || ''} onChange={(e) => setEditSpeaker({ ...editSpeaker, linkedin: e.target.value })}/>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
                <input type="url" className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.instagram || ''} onChange={(e) => setEditSpeaker({ ...editSpeaker, instagram: e.target.value })}/>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">X (Twitter) URL</label>
                <input type="url" className="w-full border px-3 py-2 rounded mt-1" value={editSpeaker.twitter || ''} onChange={(e) => setEditSpeaker({ ...editSpeaker, twitter: e.target.value })}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Photo</label>
                <input type="file" accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" onChange={(e) => setEditSpeaker({ ...editSpeaker, photoFile: e.target.files?.[0] })}/>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button className="bg-neutral-600 text-white px-4 py-2 rounded hover:bg-neutral-700" onClick={() => setEditSpeaker(null)}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}