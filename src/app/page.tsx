import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <div className="text-center max-w-2xl animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Study Schedule
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Plan your learning. One topic per study day, on the days you choose.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="rounded-full px-8">
              Get started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Demo login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
