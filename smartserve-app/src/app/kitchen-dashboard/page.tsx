import { KitchenSummaryCard } from "@/components/kitchen-dashboard/KitchenSummaryCard";
import { DishPreparationSuggestions } from "@/components/kitchen-dashboard/DishPreparationSuggestions";

export default function KitchenDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">
        Kitchen Operations Dashboard
      </h1>
      
      <KitchenSummaryCard />
      
      <DishPreparationSuggestions />

    </div>
  );
}
