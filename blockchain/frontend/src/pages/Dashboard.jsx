// pages/Dashboard.jsx
import LogForm from '../components/LogForm';
import LogTable from '../components/LogTable';

export default function Dashboard() {
  return (
    <div className="space-y-8 mt-6 max-w-5xl mx-auto">
      <LogForm />
      <LogTable />
    </div>
  );
}
