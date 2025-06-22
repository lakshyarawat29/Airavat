
import Navbar from "./components/Navbar";
import LogForm from "./components/LogForm";
import LogTable from "./components/LogTable";
const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      <div className="max-w-6xl mx-auto mt-8 space-y-8">
        <LogForm />
        <LogTable />
      </div>
    </div>
  );
}

export default App
