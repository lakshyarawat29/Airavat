// api/logs.js
const BASE_URL = 'http://localhost:3000'

export const fetchLogs = async () => {
  const res = await fetch(`${BASE_URL}/logs`);
  const data = await res.json();
  return data;
};

export const fetchLogCount = async () => {
  const res = await fetch(`${BASE_URL}/logs/count`);
  const data = await res.json();
  return data.count;
};

export const submitLog = async (log) => {
  const res = await fetch(`${BASE_URL}/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  return res.json();
};
