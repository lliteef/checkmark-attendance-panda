import Schedule from "@/components/Schedule";
import Navigation from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <Navigation />
        <Schedule />
      </div>
    </div>
  );
};

export default Index;