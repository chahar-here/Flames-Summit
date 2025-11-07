// "use client";

// import React, { useState, useRef, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { cn } from '../../../lib/utils';
// import { LoaderOne } from '../../../components/ui/loader';
// import { Scanner } from '@yudiel/react-qr-scanner'; // Correct import

// interface TicketData {
//   id: string;
//   ticketReferenceId: string;
//   customerName: string;
//   ticketId: string;
//   checkedIn: boolean;
// }

// export default function AdminQrScannerPage() {
//   const router = useRouter();
//   const [scannedData, setScannedData] = useState<string | null>(null);
//   const [ticketStatus, setTicketStatus] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [ticket, setTicket] = useState<TicketData | null>(null);

//   const handleScan = async (result: any) => {
//     if (result) {
//       setScannedData(result);
//       setLoading(true);
//       setError(null);
//       setTicketStatus(null);
//       setTicket(null);

//       // 1. Extract ticketReferenceId from the QR code data
//       // The QR code data is a string we constructed, e.g., "TEDxSVIET Ticket\nID: ABCDEFG..."
//       const scannedId = result.text.split('ID: ')[1]?.split('\n')[0];

//       if (!scannedId) {
//           setError('Invalid QR code format. Please scan a valid ticket.');
//           setLoading(false);
//           return;
//       }
      
//       // 2. Look up the ticket in the database
//       try {
//         const response = await fetch('/api/admin/tickets/lookup', { // New API route for lookup
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ ticketReferenceId: scannedId }),
//         });
        
//         const data = await response.json();
        
//         if (response.ok && data.ticket) {
//           setTicket(data.ticket);
//           if (data.ticket.checkedIn) {
//             setTicketStatus('This ticket has already been checked in.');
//             setError('Checked In');
//           } else {
//             setTicketStatus('Ticket is valid and ready to check in.');
//             setError(null);
//           }
//         } else {
//           setError(data.error || 'Ticket not found.');
//           setTicketStatus('Invalid Ticket');
//         }

//       } catch (err: any) {
//         setError('Failed to connect to server. Please try again.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const handleError = (err: any) => {
//     console.error(err);
//     setError('Failed to access camera. Please ensure camera permissions are granted.');
//   };

//   const handleCheckIn = async () => {
//     if (!ticket || ticket.checkedIn) return;

//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(`/api/admin/tickets/${ticket.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ checkedIn: true }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to check in ticket.');
//       }

//       setTicketStatus('Check-in successful!');
//       setTicket(prev => prev ? { ...prev, checkedIn: true } : null);
//       setScannedData(null); // Reset scanner
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
//       <div className="max-w-2xl w-full">
//         <h1 className="text-3xl font-bold mb-6 text-neutral-800 dark:text-neutral-200 text-center">
//           QR Code Check-in
//         </h1>
//         <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
//             Scan an attendee's e-ticket to verify and check them in.
//         </p>

//         <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
//             {/* The QR Scanner */}
//             <div className="w-full h-80 bg-gray-200 dark:bg-zinc-900 rounded-lg overflow-hidden relative">
//               <Scanner
//                 onDecode={handleScan}
//                 onError={handleError}
//                 onScannerReady={() => console.log('QR Scanner ready')}
//               />
//             </div>
            
//             {loading && <LoaderOne />}
//             {error && <div className="mt-4 text-red-500 font-bold">{error}</div>}

//             {/* Scanned Ticket Info */}
//             {ticket && (
//               <div className="mt-6 p-4 rounded-md bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700">
//                 <h3 className="text-lg font-semibold mb-2">Ticket Scanned:</h3>
//                 <p><strong>Name:</strong> {ticket.customerName}</p>
//                 <p><strong>Ticket Type:</strong> {ticket.ticketId}</p>
//                 <p><strong>Status:</strong> <span className={ticket.checkedIn ? 'text-green-500' : 'text-red-500'}>
//                     {ticket.checkedIn ? 'Already Checked In' : 'Not Checked In'}
//                 </span></p>
//                 {!ticket.checkedIn && (
//                   <button onClick={handleCheckIn} className="mt-4 w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 disabled:opacity-50">
//                     Check In Attendee
//                   </button>
//                 )}
//               </div>
//             )}
//         </div>
//         <div className="flex justify-center mt-6">
//             <button onClick={() => router.push('/admin/dashboard/tickets')} className="text-blue-600 hover:underline">
//                 &larr; Back to Ticket List
//             </button>
//         </div>
//       </div>
//     </div>
//   );
// }
