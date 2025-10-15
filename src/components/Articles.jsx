// Nhan
import { useState } from "react";
import { BsStarFill, BsChat, BsBookmark, BsThreeDots } from "react-icons/bs";

const Articles = () => {
  const [activeTab, setActiveTab] = useState("For you");

  const tabs = ["For you", "Featured"];

  const articles = [
    {
      id: 1,
      author: "Tomas Pueyo",
      title: "Why Warm Countries Are Poorer",
      description: "The most underrated factor",
      date: "Sep 29",
      stats: { likes: "5.6K", comments: 223 },
      image:
        "https://miro.medium.com/v2/resize:fit:700/1*qJ3FGJFzN9vjR3RQGvQxPg.jpeg",
    },
    {
      id: 2,
      author: "Michael Lim",
      title:
        "How A One-Person Business Model Will Make You Stupidly Wealthy.",
      description: "According to one-person business king Dan Koe.",
      date: "Aug 12",
      stats: { likes: "1.5K", comments: 59 },
      image:
        "https://miro.medium.com/v2/resize:fit:700/1*smPmfqS4oQgYGzFEKvzCrg.jpeg",
    },
    {
      id: 3,
      author: "Alex Mathers",
      title:
        "Seven weird habits that make people obsessively attracted to you",
      description:
        "I spent years trying to figure out why some people are magnetic while others fade into the background.",
      date: "Sep 11",
      stats: { likes: "7.6K", comments: 216 },
      image:
        "https://miro.medium.com/v2/resize:fit:700/1*mhbGmRtuY2nHTZfV6qXChA.jpeg",
    },
  ];

  return (
    <div className="px-6 py-4">
      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-lg font-medium relative ${
              activeTab === tab
                ? "text-black after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-8">
        {articles.map((a) => (
          <div
            key={a.id}
            className="flex justify-between items-start border-b border-gray-200 pb-6"
          >
            {/* Left */}
            <div className="flex-1 pr-4">
              <p className="text-sm text-gray-600 mb-1">{a.author}</p>
              <h2 className="text-xl font-semibold mb-1 hover:underline cursor-pointer">
                {a.title}
              </h2>
              <p className="text-gray-600 mb-3">{a.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{a.date}</span>
                <span className="flex items-center gap-1">
                  <BsStarFill className="text-yellow-500" /> {a.stats.likes}
                </span>
                <span className="flex items-center gap-1">
                  <BsChat /> {a.stats.comments}
                </span>
                <BsBookmark className="ml-auto cursor-pointer hover:text-black" />
                <BsThreeDots className="cursor-pointer hover:text-black" />
              </div>
            </div>

            {/* Right */}
            <img
              src={a.image}
              alt={a.title}
              className="w-36 h-24 object-cover rounded-md"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Articles;
