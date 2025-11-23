import { useEffect, useState, useRef } from "react";

export default function TopicSelector({ selectedTopics, setSelectedTopics }) {
  const [topics, setTopics] = useState([]);
  const [open, setOpen] = useState(false);

  const ref = useRef(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/topics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setTopics(data);
      } catch (err) {
        console.error("Failed to load topics", err);
      }
    };

    fetchTopics();
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (topicId) => {
    if (!selectedTopics.includes(topicId)) {
      setSelectedTopics([...selectedTopics, topicId]);
    }
    setOpen(false);
  };

  return (
    <div className="relative mb-4 max-w-md" ref={ref}>
      <label className="font-semibold text-sm block mb-1">Topics</label>

      <button
        onClick={() => setOpen(!open)}
        className="w-95 inline-flex items-center justify-between 
        rounded-full px-4 py-2 text-sm font-semibold
        bg-white text-gray-700 ring-1 ring-gray-300 
         transition cursor-pointer"
      >
        {!selectedTopics || selectedTopics.length === 0
          ? "-- Choose a topic --"
          : `${selectedTopics.length} topic(s) selected`}

        <svg
          className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 w-95 bg-white rounded-xl shadow-lg ring-1 ring-black/10 z-50">
          <ul className="py-1 text-sm text-gray-700 max-h-56 overflow-y-auto">
            {topics.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => handleSelect(t.id)}
                  className="flex items-center justify-between w-full 
                  px-4 py-2 hover:bg-gray-100 transition text-left cursor-pointer"
                >
                  {t.name}
                  {selectedTopics.includes(t.id) && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-black-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        d="M4.5 12.75l6 6 9-13.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 mt-3 flex-wrap">
        {selectedTopics.map((id) => {
          const topic = topics.find((x) => x.id === id);
          if (!topic) return null;

          return (
            <span
              key={id}
              className="px-3 py-1 bg-gray-100 text-sm rounded-full text-gray-600 flex items-center gap-2"
            >
              {topic.name}
              <button
                className="text-gray-400 font-bold cursor-pointer"
                onClick={() =>
                  setSelectedTopics(selectedTopics.filter((x) => x !== id))
                }
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
