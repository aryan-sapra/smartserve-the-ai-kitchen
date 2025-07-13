
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, BarChartHorizontalBig } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Reports & Exports</h1>
        <p className="text-muted-foreground">Generate and download various operational reports.</p>
      </div>

      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Select a report to generate and download.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-4 flex flex-col items-start gap-3">
            <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">User Attendance Report</h3>
            </div>
            <p className="text-sm text-muted-foreground flex-grow">Detailed log of all user check-ins, including dates, times, and dietary preferences.</p>
            <Button variant="outline" className="w-full mt-auto">
              <Download className="mr-2 h-4 w-4" /> Download CSV
            </Button>
          </Card>

          <Card className="p-4 flex flex-col items-start gap-3">
             <div className="flex items-center gap-3">
                <BarChartHorizontalBig className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">Waste Log Report</h3>
            </div>
            <p className="text-sm text-muted-foreground flex-grow">Comprehensive record of all logged waste, including category, amount, date, and logger.</p>
            <Button variant="outline" className="w-full mt-auto">
              <Download className="mr-2 h-4 w-4" /> Download CSV
            </Button>
          </Card>

          <Card className="p-4 flex flex-col items-start gap-3">
            <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">Monthly Summary Report</h3>
            </div>
            <p className="text-sm text-muted-foreground flex-grow">Aggregated data for check-ins, dietary trends, and waste for the selected month.</p>
            <Button variant="outline" className="w-full mt-auto">
              <Download className="mr-2 h-4 w-4" /> Download CSV
            </Button>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
