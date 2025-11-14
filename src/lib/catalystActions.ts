"use server";
import { db, storage } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export interface CatalystApplicationData {
  fullname: string;
  email: string;
  phone: string;
  linkedin: string;
  xprofile: string;
  occupation: string;
  experience: string;
  fileUrls: string[];
  submittedAt: string;
}

// ------------------------------------
// CHECK UNIQUENESS
// ------------------------------------
export async function checkCatalystUniqueness(
  email: string,
  phone: string
) {
  const q = query(
    collection(db, "catalystApplications"),
    where("email", "==", email),
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return {
      success: false,
      message: "This email already exists in our database.",
    };
  }

  return { success: true };
}

// ------------------------------------
// UPLOAD FILES
// ------------------------------------
export async function uploadCatalystFiles(files: File[]) {
  const uploadedUrls: string[] = [];

  for (let file of files) {
    const storageRef = ref(storage, `catalystUploads/${Date.now()}-${file.name}`);
    const uploaded = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(uploaded.ref);

    uploadedUrls.push(url);
  }

  return uploadedUrls;
}

// ------------------------------------
// SUBMIT APPLICATION
// ------------------------------------
export async function submitCatalystApplication(
  data: CatalystApplicationData
) {
  try {
    await addDoc(collection(db, "catalystApplications"), data);

    return {
      success: true,
      message: "Application submitted successfully!",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to submit. Try again.",
    };
  }
}
