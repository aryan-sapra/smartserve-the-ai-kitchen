import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KitchenLoginForm } from "@/components/kitchen-dashboard/KitchenLoginForm";
import { SmartServeLogo } from "@/components/icons/smartserve-logo";
import Link from "next/link";

export default function KitchenLoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
       <Link href="/" className="flex items-center gap-2 mb-6 text-primary hover:text-primary/90">
          <SmartServeLogo className="h-8 w-8" />
          <span className="text-xl font-semibold">SmartServe</span>
        </Link>
      <Card className="w-full max-w-sm shadow-xl rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl text-center">Kitchen Staff Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the kitchen dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <KitchenLoginForm />
        </CardContent>
      </Card>
       <p className="mt-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} SmartServe Solutions. For authorized personnel only.
      </p>
    </div>
  );
}
