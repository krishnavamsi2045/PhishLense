import DashboardStats from "../components/DashboardStats";
import ScanHistory from "../components/ScanHistory";
import AnalyticsChart from "../components/AnalyticsChart";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <DashboardStats />

      <AnalyticsChart />

      <ScanHistory />
    </div>
  );
}