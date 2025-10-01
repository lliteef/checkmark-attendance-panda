import SessionSchedule from "@/components/SessionSchedule";
import Navigation from "@/components/Navigation";
import Schedule from "@/components/Schedule";
import DutyDisplay from "@/components/DutyDisplay";

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <Navigation />
        <div className="space-y-8 mt-8">
          <DutyDisplay />
          <Schedule />
          <SessionSchedule />
        </div>
      </div>
    </div>
  );
};

export default Index;