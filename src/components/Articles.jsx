// Nhan
import { useState } from "react";
import { BsStarFill, BsChat, BsBookmark, BsThreeDots } from "react-icons/bs";
import Article from "../components/Article";
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
        "https://miro.medium.com/v2/resize:fit:1100/format:webp/0*lxFvb1HH-8YimbHZ.png",
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
        "https://miro.medium.com/v2/resize:fit:720/format:webp/1*j4WqTsT_w6rgKEcb9Jameg.jpeg",
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
        "https://miro.medium.com/v2/resize:fit:720/format:webp/0*h9UKHWim60EijQYd.png",
    },
    {
      id: 4,
      author: "Alex Mathers",
      title:
        "Seven weird habits that make people obsessively attracted to you",
      description:
        "It's 2025. The year in which the long-awaited and already much-acclaimed sequel to one of the greatest indie games ever",
      date: "Oct 6",
      stats: { likes: "70", comments: 1 },
      image:
        "https://miro.medium.com/v2/resize:fit:720/format:webp/0*HX0D29gcujUFy0HL.jpg",
    },
    {
      id: 5,
      author: "Sports Illustrated",
      title: "Cristiano Ronaldo’s Relentless Pursuit of Greatness",
      description:
        "Even at 39, CR7 continues to redefine what it means to be a professional athlete.",
      date: "Oct 10",
      stats: { likes: "8.9K", comments: 412 },
      image:
        "https://www.ameco.et/english/wp-content/uploads/2023/06/mesi.jpg",
    },
    {
      id: 6,
      author: "The Athletic",
      title: "Inside Ronaldo’s Daily Routine: Diet, Mindset, and Motivation",
      description:
        "A look at the extreme discipline and mental strength that made Cristiano Ronaldo an icon.",
      date: "Oct 12",
      stats: { likes: "6.4K", comments: 187 },
      image:
        "https://vcdn1-giadinh.vnecdn.net/2018/07/04/aa-1530688176.jpg?w=500&h=300&q=100&dpr=1&fit=crop&s=JvlOKPvj_jPkBIzqVPcaKQ",
    },
    {
      id: 7,
      author: "Goal.com",
      title: "From Madeira to Riyadh: The Global Legacy of Cristiano Ronaldo",
      description:
        "Tracing the career path of CR7 from his humble beginnings to his Saudi Arabian chapter.",
      date: "Oct 7",
      stats: { likes: "5.1K", comments: 254 },
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6BxsTmtO2GpH26s2Do9GKH5Nwpbp583VKYA&s",
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
            className={`pb-3 text-lg font-medium relative ${activeTab === tab
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
          <Article key={a.id} data={a} />
        ))}

      </div>
    </div>
  );
};

export default Articles;
