import { WasteLogForm } from "@/components/kitchen-dashboard/WasteLogForm";

export default function LogWastePage() {
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl sm:text-3xl font-bold">Log Waste</h1>
      <p className="text-muted-foreground">
        Record any food or water waste to help track and reduce spoilage.
      </p>
      <WasteLogForm />
    </div>
  );
}
