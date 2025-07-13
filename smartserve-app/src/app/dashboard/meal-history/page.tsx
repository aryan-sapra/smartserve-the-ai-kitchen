import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mealHistory = [
  { date: "2024-07-21", meal: "Lunch", item: "Vegetable Pulao", preference: "Vegetarian", feedback: "Good" },
  { date: "2024-07-20", meal: "Dinner", item: "Chicken Curry", preference: "Non-Vegetarian", feedback: "Excellent" },
  { date: "2024-07-20", meal: "Lunch", item: "Paneer Tikka", preference: "Vegetarian", feedback: "Spicy" },
  { date: "2024-07-19", meal: "Dinner", item: "Skipped", preference: "Skip", feedback: null },
];

export default function MealHistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Meal History</h1>
      <p className="text-muted-foreground">Review your past meal selections and feedback.</p>
      <div className="border rounded-xl shadow-lg">
        <Table>
          <TableCaption>A list of your recent meals.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Meal</TableHead>
              <TableHead>Item/Selection</TableHead>
              <TableHead>Preference</TableHead>
              <TableHead className="text-right">Feedback</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mealHistory.map((entry, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{entry.date}</TableCell>
                <TableCell>{entry.meal}</TableCell>
                <TableCell>{entry.item}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      entry.preference === "Skip" ? "outline" : 
                      entry.preference === "Vegetarian" ? "default" : "secondary" 
                    }
                    className={
                      entry.preference === "Vegetarian" ? "bg-accent text-accent-foreground" : ""
                    }
                  >
                    {entry.preference}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{entry.feedback || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
