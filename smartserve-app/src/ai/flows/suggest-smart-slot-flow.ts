
'use server';
/**
 * @fileOverview A Genkit flow to suggest less crowded lunch slots.
 *
 * - suggestSmartSlot - A function that suggests lunch slots based on current demand and user preferences.
 * - SuggestSmartSlotInput - The input type for the suggestSmartSlot function.
 * - SuggestSmartSlotOutput - The return type for the suggestSmartSlot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define valid preferred lunch timing slots (must match what's stored in check-in logs)
const PreferredLunchTimingSlotSchema = z.enum(["12-1", "1-2", "2-3", "3-4"]);

const SuggestSmartSlotInputSchema = z.object({
  userPreferredSlot: PreferredLunchTimingSlotSchema.describe('The employee\'s general preferred lunch timing slot (e.g., "1-2" for 1 PM - 2 PM).'),
  preferredSlotDistribution: z.record(PreferredLunchTimingSlotSchema, z.number()).describe('An object showing the count of users for each preferred lunch timing slot today. E.g., {"12-1": 30, "1-2": 50, "2-3": 20, "3-4": 10}. Counts exclude users who skipped their meal.'),
  userHistoricalAdherenceFactor: z.string().optional().describe('A conceptual factor indicating how strictly the user usually adheres to their preferred slot (e.g., "usually sticks to preferred time", "often flexible", "prefers early within slot"). This is for the AI to consider directionally as actual data is not available.'),
});
export type SuggestSmartSlotInput = z.infer<typeof SuggestSmartSlotInputSchema>;

const SuggestedSlotDetailSchema = z.object({
    slotDescription: z.string().describe('A human-readable suggested time or slightly adjusted slot (e.g., "Try 12:45 PM - 01:00 PM", "Your preferred 02:00 PM - 03:00 PM slot looks good", "Consider 01:15 PM - 01:30 PM"). Should be actionable for the user.'),
    reasoning: z.string().describe('A brief explanation for the suggestion (e.g., "Quieter than your preferred slot.", "Minimal wait expected during this period.").'),
    congestionLevel: z.enum(["Low", "Medium", "High", "Very High"]).describe('Estimated congestion level for the suggested slot.'),
});

const SuggestSmartSlotOutputSchema = z.object({
  suggestions: z.array(SuggestedSlotDetailSchema).describe('An array of 1 to 3 smart lunch slot suggestions.'),
});
export type SuggestSmartSlotOutput = z.infer<typeof SuggestSmartSlotOutputSchema>;


export async function suggestSmartSlot(input: SuggestSmartSlotInput): Promise<SuggestSmartSlotOutput> {
  return suggestSmartSlotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSmartSlotPrompt',
  input: {schema: SuggestSmartSlotInputSchema},
  output: {schema: SuggestSmartSlotOutputSchema},
  prompt: `You are a helpful assistant that suggests optimal lunch time slots for corporate employees to avoid long queues.
The available cafeteria lunch slots are: 12:00 PM - 01:00 PM (12-1), 01:00 PM - 02:00 PM (1-2), 02:00 PM - 03:00 PM (2-3), and 03:00 PM - 04:00 PM (3-4).

Analyze the following information:
1.  User's Preferred Slot: {{{userPreferredSlot}}}
2.  Today's Distribution of Preferred Slots (number of employees per slot):
    - 12 PM - 1 PM (12-1): {{preferredSlotDistribution.[12-1]}}
    - 1 PM - 2 PM (1-2): {{preferredSlotDistribution.[1-2]}}
    - 2 PM - 3 PM (2-3): {{preferredSlotDistribution.[2-3]}}
    - 3 PM - 4 PM (3-4): {{preferredSlotDistribution.[3-4]}}
{{#if userHistoricalAdherenceFactor}}3. User's Adherence Tendency: {{{userHistoricalAdherenceFactor}}} (Consider this qualitatively. For example, if they are flexible, they might be more open to suggestions further from their preference. If they stick to their time, try to suggest something very close or within their slot but at a less busy moment.){{/if}}

Your goal is to provide 1-3 "Smart Slot" suggestions.
For each suggestion, provide:
-   'slotDescription': A specific, actionable time or slightly adjusted slot (e.g., "Try around 12:45 PM", "01:00 PM - 01:15 PM seems good", "Your preferred 02:00 PM - 03:00 PM slot is currently not too busy"). Try to be more granular than the 1-hour slots if suggesting an adjustment within or near the user's preferred slot.
-   'reasoning': A brief, helpful explanation for why this slot is suggested (e.g., "This is just before the main rush in your preferred 1-2 PM slot.", "This slot is significantly less crowded today.").
-   'congestionLevel': Estimate the congestion as "Low", "Medium", "High", or "Very High".

Prioritize:
-   Minimizing wait times for the user by suggesting less congested periods.
-   Staying reasonably close to the user's preferred slot, especially if their adherence factor suggests they prefer sticking to their time.
-   If the user's preferred slot is genuinely not very busy, it's okay to confirm that it's a good time.
-   If all slots are busy, suggest the relatively least busy one or an edge time.

Do not suggest times outside the 12 PM - 4 PM lunch window.
Ensure your output is in the specified JSON format.
Consider the total number of people in a slot relative to others. A slot with 50 people is much busier than one with 10.
Example of good reasoning: "The 1-2 PM slot is the busiest today with {{preferredSlotDistribution.[1-2]}} people. Going slightly earlier, around 12:50 PM, could help you avoid the peak."
If a slot has 0 or very few people, that's a "Low" congestion. If it has the highest number, it's likely "High" or "Very High".
`,
});

const suggestSmartSlotFlow = ai.defineFlow(
  {
    name: 'suggestSmartSlotFlow',
    inputSchema: SuggestSmartSlotInputSchema,
    outputSchema: SuggestSmartSlotOutputSchema,
  },
  async (input: SuggestSmartSlotInput): Promise<SuggestSmartSlotOutput> => {
    // Ensure all slots are present in the distribution, defaulting to 0 if not provided.
    const filledDistribution: Record<z.infer<typeof PreferredLunchTimingSlotSchema>, number> = {
        "12-1": input.preferredSlotDistribution["12-1"] || 0,
        "1-2": input.preferredSlotDistribution["1-2"] || 0,
        "2-3": input.preferredSlotDistribution["2-3"] || 0,
        "3-4": input.preferredSlotDistribution["3-4"] || 0,
    };

    const flowInput = {
        ...input,
        preferredSlotDistribution: filledDistribution,
    };
    
    const {output} = await prompt(flowInput);

    if (!output || !output.suggestions || output.suggestions.length === 0) {
        return { suggestions: [
            { slotDescription: "Unable to determine", reasoning: "Could not generate smart slot suggestions at this time. Please check overall demand or try again later.", congestionLevel: "Medium" }
        ]};
    }
    return output;
  }
);

