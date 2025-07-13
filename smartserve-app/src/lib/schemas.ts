import { z } from 'zod';

export const checkInFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }).max(50, { message: 'Name must be at most 50 characters long.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  dietPreference: z.enum(['veg', 'non-veg', 'vegan'], {
    required_error: 'Please select your dietary preference.',
  }),
  preferredLunchTiming: z.enum(['12-1', '1-2', '2-3', '3-4'], {
    required_error: 'Please select your preferred lunch timing.',
  }),
});

export type CheckInFormValues = z.infer<typeof checkInFormSchema>;

// This will be the structure in localStorage for smartserve_checkins_log
export interface StoredCheckInEntry extends CheckInFormValues {
  id: string;
  date: string;
  status: string;
  todaysActualDiet: 'veg' | 'non-veg' | 'vegan'; // What they actually chose for today
  skipMealToday: boolean; // true if they chose to skip
}


export const wasteLogFormSchema = z.object({
  category: z.enum(['food', 'water'], {
    required_error: 'Please select a category.',
  }),
  amount: z.coerce.number().min(0.1, { message: 'Amount must be greater than 0.' }),
});

export type WasteLogFormValues = z.infer<typeof wasteLogFormSchema>;

export const adminLoginFormSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginFormSchema>;

export const kitchenLoginFormSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export type KitchenLoginFormValues = z.infer<typeof kitchenLoginFormSchema>;