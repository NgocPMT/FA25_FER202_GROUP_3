import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function MyPublications() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const me = JSON.parse(localStorage.getItem("user"));
  const myId = me?.id;

  useEffect(() => {
    loadMyPublications();
  }, []);

  async function loadMyPublications() {
    try {
      // 1. Lấy tất cả publications
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/publications`
      );
      const all = await res.json();

      const myPubs = [];

      // 2. Với mỗi publication, kiểm tra membership
      for (const pub of all.items || all) {
        const memRes = await fetch(
          `${import.meta.env.VITE_API_URL}/publications/${pub.id}/members`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!memRes.ok) continue;

        const members = await memRes.json();

        const found = members.some((m) => m.id === myId);

        if (found) myPubs.push(pub);
      }

      setList(myPubs);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="text-center p-6">Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Publications</h2>

      {list.length === 0 && (
        <p className="text-gray-500">You have not joined any publications.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((p) => (
          <Link
            key={p.id}
            to={`/publications/${p.id}`}
            className="border rounded-xl p-4 shadow hover:bg-gray-50 transition"
          >
            <img
              src={p.avatarUrl}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h3 className="font-bold text-lg">{p.name}</h3>
            <p className="text-gray-600 text-sm">{p.bio}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
