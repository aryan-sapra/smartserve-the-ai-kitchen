
'use server';
/**
 * @fileOverview A Genkit flow to suggest dish quantities for the kitchen.
 *
 * - suggestDishQuantities - A function that suggests dish quantities based on meal preferences.
 * - SuggestDishQuantitiesInput - The input type for the suggestDishQuantities function.
 * - SuggestDishQuantitiesOutput - The return type for the suggestDishQuantities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { allAvailableDishNames } from '@/lib/menu-data'; // Import the master list of dish names

const DishSuggestionSchema = z.object({
  dishName: z.string().describe('The name of the dish to prepare. This MUST be one of the provided available dish names.'),
  quantity: z.string().describe('The suggested quantity or number of portions (e.g., "Approx. 15 portions", "Standard + 10%", "N/A if count is 0", "Approx. 100 Naan (for event)").'),
  note: z.string().describe('Additional notes or reasons for the suggestion, incorporating historical data or event factors if provided. If a category has 0 attendees, note why a dish might not be suggested. For staples during large events, note it is sized for estimated event attendance.'),
});

const SuggestDishQuantitiesInputSchema = z.object({
  totalCheckIns: z.number().describe('Total number of employee check-ins for the day (those not skipping meal).'),
  vegCount: z.number().describe('Number of vegetarian preferences among those attending meal.'),
  nonVegCount: z.number().describe('Number of non-vegetarian preferences among those attending meal.'),
  veganCount: z.number().describe('Number of vegan preferences among those attending meal.'),
  historicalWastePercentage: z.number().optional().describe('Optional. Average historical waste percentage for similar meals (e.g., 0.1 for 10%). Helps in adjusting quantities to minimize waste.'),
  specialEventMultiplier: z.number().optional().describe('Optional. A multiplier for special events (e.g., 1.2 for a 20% increase in quantity). Default is 1.0 (no event). A multiplier >= 1.3 suggests a significant event where totalCheckIns might not reflect total event attendance.'),
  dayOfWeekFactor: z.string().optional().describe('Optional. A textual hint about typical demand for the current day of the week (e.g., "Friday - expect higher non-veg demand").'),
});
export type SuggestDishQuantitiesInput = z.infer<typeof SuggestDishQuantitiesInputSchema>;

const SuggestDishQuantitiesOutputSchema = z.object({
  suggestions: z.array(DishSuggestionSchema).describe('An array of dish preparation suggestions.'),
});
export type SuggestDishQuantitiesOutput = z.infer<typeof SuggestDishQuantitiesOutputSchema>;


export async function suggestDishQuantities(input: SuggestDishQuantitiesInput): Promise<SuggestDishQuantitiesOutput> {
  return suggestDishQuantitiesFlow(input);
}

// Internal schema for the prompt, including pre-processed fields and available dishes
const PromptInputSchema = SuggestDishQuantitiesInputSchema.extend({
  processedHistoricalWaste: z.string().optional(),
  exampleVegPortions: z.string(),
  exampleNonVegPortions: z.string(),
  exampleVeganPortions: z.string(),
  exampleStapleBuffer: z.string(),
  effectiveSpecialEventMultiplier: z.number(),
  availableDishNames: z.array(z.string()).describe('A list of all dish names that the kitchen can prepare. You MUST choose from this list for your suggestions.')
});
type PromptInput = z.infer<typeof PromptInputSchema>;


const prompt = ai.definePrompt({
  name: 'suggestDishQuantitiesPrompt',
  input: {schema: PromptInputSchema}, // Use the extended schema for the prompt
  output: {schema: SuggestDishQuantitiesOutputSchema},
  prompt: `You are a kitchen planning assistant for a corporate cafeteria.
Based on the following daily meal check-in data, contextual factors, and the list of available dishes, provide 3-5 dish preparation suggestions.
Your suggestions for 'dishName' MUST be chosen from the 'Available Dishes' list provided below.
Consider a balanced menu and try to minimize potential waste by referring to historical data if available.
Adjust quantities for special events if indicated. Use day-of-week insights for demand planning.

Today's Meal Attendee Data (those not skipping meal):
- Total Meal Attendees: {{{totalCheckIns}}}
- Vegetarian Preferences: {{{vegCount}}}
- Non-Vegetarian Preferences: {{{nonVegCount}}}
- Vegan Preferences: {{{veganCount}}}

Contextual Factors:
{{#if historicalWastePercentage}}- Historical Waste Percentage: Approximately {{{processedHistoricalWaste}}}. Aim to reduce this.{{/if}}
- Special Event Multiplier: {{{effectiveSpecialEventMultiplier}}} (1.0 is normal). If this is >= 1.3, it indicates a significant event; see 'Quantity Calculation Guide'.
{{#if dayOfWeekFactor}}- Day of Week Insight: {{{dayOfWeekFactor}}}{{/if}}

Available Dishes (You MUST select dish names from this list for your suggestions):
{{#each availableDishNames}}
- {{{this}}}
{{/each}}

Quantity Calculation Guide:
Your primary goal is to suggest appropriate quantities based on the meal attendee data and contextual factors.

1.  **Standard Day (effectiveSpecialEventMultiplier < 1.3):**
    *   Vegetarian Main Dishes:
        *   If \\\`vegCount\\\` is 0, do NOT suggest a vegetarian main dish from the available list, or state quantity as "0 portions" or "N/A".
        *   If \\\`vegCount\\\` is > 0, suggest a quantity for a vegetarian dish (from the available list) to comfortably serve \\\`vegCount\\\` employees. For very small counts (e.g., 1-5), aim for that exact number or a tiny buffer (e.g., +1 portion). For larger counts, a small buffer (e.g., 5-10%) is acceptable.
    *   Non-Vegetarian Main Dishes:
        *   If \\\`nonVegCount\\\` is 0, do NOT suggest a non-vegetarian main dish, or state quantity as "0 portions" or "N/A".
        *   If \\\`nonVegCount\\\` is > 0, suggest a quantity for a non-vegetarian dish (from the available list) to comfortably serve \\\`nonVegCount\\\` employees. Apply similar buffering logic.
    *   Vegan Dishes:
        *   If \\\`veganCount\\\` is 0, do NOT suggest a specific vegan main dish unless it's a general side. If suggested, state quantity as "0 portions" or "N/A".
        *   If \\\`veganCount\\\` is > 0, suggest a quantity for a vegan dish (from the available list) to comfortably serve \\\`veganCount\\\` employees. Apply similar buffering logic.
    *   Apply \\\`effectiveSpecialEventMultiplier\\\` as a direct multiplier to these calculated quantities if it's slightly above 1.0 (e.g. 1.1) but still less than 1.3.

2.  **Significant Special Event (effectiveSpecialEventMultiplier >= 1.3):**
    *   **IMPORTANT:** In this case, the provided 'Total Meal Attendees', \\\`vegCount\\\`, etc., might be very low (e.g., < 20) and represent only early staff check-ins, NOT the total expected event attendance.
    *   **Estimate Target Event Attendance:** Assume a typical daily cafeteria attendance might be around 70 people. Multiply this typical attendance by the \\\`effectiveSpecialEventMultiplier\\\` to get a rough target for the event (e.g., if multiplier is 1.8, target is 70 * 1.8 = 126 people).
    *   **Dietary Preference Ratios for Event:**
        *   If \\\`totalCheckIns\\\` > 0: Calculate the *percentage* of vegetarian, non-vegetarian, and vegan preferences from the provided \\\`vegCount\\\`, \\\`nonVegCount\\\`, \\\`veganCount\\\` relative to \\\`totalCheckIns\\\`.
        *   Apply these *percentages* to your 'Estimate Target Event Attendance' to determine the number of portions needed for each dietary type for the event.
        *   Example: If current \\\`totalCheckIns\\\`=10, \\\`vegCount\\\`=5 (50%), \\\`nonVegCount\\\`=5 (50%), and estimated target event attendance is 100. You should plan for ~50 vegetarian portions and ~50 non-vegetarian portions.
        *   If \\\`totalCheckIns\\\` is 0 (no early check-ins): Assume a balanced dietary split for the 'Estimate Target Event Attendance' (e.g., 40% veg, 40% non-veg, 20% vegan).
    *   **Suggest Dish Quantities for the Event:** Your suggested quantities for main dishes MUST be sufficient for this *scaled-up target event attendance* and its calculated dietary breakdown.
    *   **Crucially, for quantity calculations during a significant special event, if the \`totalCheckIns\` (and by extension \`vegCount\`, \`nonVegCount\`, \`veganCount\`) are low (e.g., < 20) and clearly don't represent the full event, DO NOT use these low counts as the primary base for your quantity calculations for the event. Instead, use your 'Estimate Target Event Attendance' and its derived dietary breakdown as the primary base for all dish quantities (mains and staples).**
    *   Do NOT simply multiply the low \\\`vegCount\\\` by the event multiplier. You must scale up to the implied total event size.

3.  **Staples (e.g., Rice, Roti from the available list):**
    *   For a **Standard Day**, base this on 'totalCheckIns' with a reasonable buffer (e.g., 1-1.5 units per person, considering it's a staple).
    *   For a **Significant Special Event**, your suggested quantity for staples (from the available list) MUST be based on your 'Estimate Target Event Attendance' (e.g., 1 to 1.5 units per person for the total estimated event attendance), NOT on the low \\\`totalCheckIns\\\` value. The note for staples during a significant event should reflect that it's sized for the larger estimated attendance (e.g., "Sized for approx. [Target Event Attendance] people" or "Approx. 120 Naan (for event)").

4.  **Waste Reduction:**
    *   If 'historicalWastePercentage' is high (e.g., > 10% as indicated by 'processedHistoricalWaste'), be slightly more conservative with buffers for relevant dish types, especially for standard days. For large events, ensuring enough food is primary, but still be mindful.

5.  **Output Quantity String:** The 'quantity' string in your output should be descriptive, like "Approx. X portions", "Serves Y-Z people", "Standard + N% buffer", or "N/A (0 preference)". For staples during large events, it can be more direct, e.g., "Approx. 120 Naan".

General Dish Selection:
- Suggest 3-5 dishes in total, selected EXCLUSIVELY from the 'Available Dishes' list.
- Include appropriate main courses (from the list) and at least one staple (from the list).
- For Standard Days: Only suggest main courses (from the list) for dietary preferences where the count is greater than 0. Quantities for these should be based on the specific preference counts.
- For Significant Special Events: Ensure main courses are suggested to cover the scaled-up dietary needs for the event, and staples are sufficient for the 'Estimate Target Event Attendance'.
- Focus on common Indian corporate lunch items available in the provided list.

The quantities shown in the 'Example output format' below (like "{{{exampleVegPortions}}}") are dynamically calculated based on the input *solely to illustrate the desired format and type of reasoning*. **Your role is to pick appropriate dishes from the 'Available Dishes' list for the GIVEN INPUTS and then calculate NEW quantities for THOSE DISHES based on the 'Quantity Calculation Guide' above. Do NOT directly copy or be numerically influenced by the example quantities in the illustrative format below, especially during special events where your calculations should be based on the scaled-up estimated event attendance.**

Example output format (Illustrative only. Calculate fresh based on inputs, guide, and ensure dishName is from the Available Dishes list):
{
  "suggestions": [
    { "dishName": "Paneer Butter Masala", "quantity": "{{{exampleVegPortions}}}", "note": "High demand based on veg count. Chosen from available dishes. {{#if historicalWastePercentage}}Consider past waste of {{{processedHistoricalWaste}}}.{{/if}} {{#if dayOfWeekFactor}}Factor in: {{{dayOfWeekFactor}}}{{/if}}" },
    { "dishName": "Chicken Biryani", "quantity": "{{{exampleNonVegPortions}}}", "note": "Popular non-veg choice from available list. {{#if dayOfWeekFactor}}Factor in: {{{dayOfWeekFactor}}}{{/if}}" },
    { "dishName": "Vegan Dal Makhani", "quantity": "{{{exampleVeganPortions}}}", "note": "Ensure vegan option is available from the list. If veganCount is 0 and it's not a special event, note this." },
    { "dishName": "Steamed Rice", "quantity": "{{{exampleStapleBuffer}}}", "note": "General buffer, serves all. Selected from available staples. Adjust slightly if overall historical waste is high. If this is a large event, this should be sized for the event." }
  ]
}
Output MUST be in the format specified by the output schema, and all dishName values MUST be from the provided 'Available Dishes' list.
`,
});

const suggestDishQuantitiesFlow = ai.defineFlow(
  {
    name: 'suggestDishQuantitiesFlow',
    inputSchema: SuggestDishQuantitiesInputSchema,  // External contract uses original schema
    outputSchema: SuggestDishQuantitiesOutputSchema,
  },
  async (input: SuggestDishQuantitiesInput): Promise<SuggestDishQuantitiesOutput> => {
    const effectiveSpecialEventMultiplier = input.specialEventMultiplier || 1.0;
    
    let processedHistoricalWaste: string | undefined = undefined;
    if (input.historicalWastePercentage !== undefined) {
        processedHistoricalWaste = `${(input.historicalWastePercentage * 100).toFixed(0)}%`;
    }

    // This function now primarily generates illustrative examples for the prompt format
    const calculateExamplePortion = (count: number, multiplierForExample: number) => {
        // For events, the example portions might seem low if count is low,
        // but the prompt guide instructs the AI to scale differently for actual event suggestions.
        let baseQuantity = 0;
        if (count === 0 && multiplierForExample < 1.3) return "N/A (0 preference)";
        
        if (count > 0 && count <=5) baseQuantity = count + 1; 
        else if (count > 5) baseQuantity = Math.ceil(count * 1.1); 
        else baseQuantity = count; // This handles count = 0 if multiplier >= 1.3
        
        baseQuantity = Math.max(0, baseQuantity); 
        
        const adjustedQuantity = Math.round(baseQuantity * multiplierForExample);
        
        if (adjustedQuantity === 0 && count === 0 && multiplierForExample < 1.3) return "N/A (0 preference)";
        if (adjustedQuantity === 0 && count > 0) return `Approx. 1 portion (example for low count with multiplier)`;
        if (adjustedQuantity === 0 && count === 0 && multiplierForExample >=1.3) return `Approx. 0 portions (example, event scaling applies based on guide)`;
        
        return `Approx. ${adjustedQuantity} portion${adjustedQuantity !== 1 ? 's' : ''}`;
    };

    let vegExampleCount = input.vegCount;
    let nonVegExampleCount = input.nonVegCount;
    let veganExampleCount = input.veganCount;
    let totalExampleCount = input.totalCheckIns;

    const exampleVegPortions = calculateExamplePortion(vegExampleCount, effectiveSpecialEventMultiplier);
    const exampleNonVegPortions = calculateExamplePortion(nonVegExampleCount, effectiveSpecialEventMultiplier);
    const exampleVeganPortions = calculateExamplePortion(veganExampleCount, effectiveSpecialEventMultiplier);
    
    // Example for staple buffer also illustrates a format, actual calculation guided by prompt.
    const stapleBaseForExample = Math.max(1, Math.ceil(totalExampleCount * 0.8 * effectiveSpecialEventMultiplier)); 
    const exampleStapleBuffer = `Approx. ${stapleBaseForExample} portions (general buffer for example)`;


    const promptDataForFlow: PromptInput = {
        ...input,
        processedHistoricalWaste,
        exampleVegPortions,
        exampleNonVegPortions,
        exampleVeganPortions,
        exampleStapleBuffer,
        effectiveSpecialEventMultiplier,
        availableDishNames: allAvailableDishNames,
    };
    
    const {output} = await prompt(promptDataForFlow);
    if (!output || !output.suggestions || output.suggestions.length === 0) {
        return { suggestions: [
            { dishName: "Suggestion Error", quantity: "N/A", note: "Could not generate suggestions. Input counts might be too low, model may be recalibrating, or AI failed to adhere to constraints. Ensure 'Available Dishes' list was provided and event logic in prompt is clear."}
        ]};
    }
    
    const validSuggestions = output.suggestions.filter(suggestion => 
        allAvailableDishNames.includes(suggestion.dishName)
    );

    if (validSuggestions.length !== output.suggestions.length) {
        console.warn("AI suggested dishes not in the available list. Filtering them out. Output was:", output.suggestions);
         return { suggestions: [
            { dishName: "Suggestion Adherence Error", quantity: "N/A", note: "AI failed to adhere to the available dish list. Please retry or check prompt. Ensure 'Available Dishes' list was provided to the AI."}
        ]};
    }

    return { suggestions: validSuggestions };
  }
);


    