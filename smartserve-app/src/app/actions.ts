
"use server";

import type { CheckInFormValues, WasteLogFormValues, StoredCheckInEntry } from "@/lib/schemas";

// NOTE: localStorage interaction has been moved to the client-side components
// that call these server actions. Server actions cannot directly access localStorage.

export async function handleUserCheckIn(data: CheckInFormValues) {
  console.log("Server Action: User Check-In Data Received:", data);
  
  // In a real backend, you would save 'data' to a database here.
  // For this prototype, we simulate creating an entry that will be
  // added to localStorage by the client after this action returns.
  const newCheckInEntry: StoredCheckInEntry = {
    ...data,
    id: `u${Date.now()}`, // Simple unique ID
    date: new Date().toISOString().split('T')[0], // Today's date
    status: "Checked-in", // Assuming check-in implies this status
    todaysActualDiet: data.dietPreference, // Initialize with the form's diet preference
    skipMealToday: false, // Initialize to false, user can change this on dashboard
  };

  // Return the processed entry so the client can handle localStorage
  return { 
    success: true, 
    message: "Check-in processed successfully by server action.", 
    newCheckInEntry: newCheckInEntry 
  };
}

export async function logKitchenWaste(data: WasteLogFormValues) {
  console.log("Server Action: Kitchen Waste Logged:", data);

  // In a real backend, you would save 'data' to a database here.
  // For this prototype, we simulate creating an entry.
  const newWasteEntry = {
    ...data,
    id: `w${Date.now()}`, // Simple unique ID
    date: new Date().toISOString().split('T')[0], // Today's date
    loggedBy: "Kitchen Staff", // Mock user
    notes: data.category === 'food' ? `Excess ${data.amount}${data.category === 'food' ? 'kg' : 'L'}` : `Wasted ${data.amount}${data.category === 'food' ? 'kg' : 'L'}`, // Mock notes based on category
  };
  
  // Return the processed entry
  return { 
    success: true, 
    message: "Waste logged successfully by server action.",
    newWasteEntry: newWasteEntry
  };
}
