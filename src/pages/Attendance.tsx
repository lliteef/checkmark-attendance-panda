import AttendanceTable from "@/components/AttendanceTable";

const Attendance = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <AttendanceTable />
      </div>
    </div>
  );
};

export default Attendance;