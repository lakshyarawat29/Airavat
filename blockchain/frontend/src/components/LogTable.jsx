import { useEffect, useState } from 'react';
import { fetchLogs } from '../api/logs';

export default function LogTable() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs().then((data) => setLogs(data.logs || []));
  }, []);

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-xl p-6 shadow-lg animate-fade-in">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">📊 Logs</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Agent</th>
              <th className="p-2">Request ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Risk</th>
              <th className="p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-t hover:bg-blue-50">
                <td className="p-2">{i}</td>
                <td className="p-2 text-blue-700">{log.agent.slice(0, 6)}…</td>
                <td className="p-2">{log.requestId.slice(0, 8)}…</td>
                <td
                  className={`p-2 font-medium ${
                    log.status === 'SAFE' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {log.status}
                </td>
                <td className="p-2">{log.riskScore}</td>
                <td className="p-2">
                  {new Date(Number(log.timestamp) * 1000).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
