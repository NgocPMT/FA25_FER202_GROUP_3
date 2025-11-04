import { useState, useRef, useEffect } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { BsStarFill, BsChat } from "react-icons/bs";


export default function Stories({ filter, onToggleStatusFilter }) {
    const [activeTab, setActiveTab] = useState("Drafts");
    const [menuOpen, setMenuOpen] = useState(null);
    const menuRef = useRef(null);

    const drafts = [
        {
            id: 1,
            title: "The Future of AI Writing",
            date: "Oct 30, 2025",
            readingTime: "5 min read",
        },
        {
            id: 2,
            title: "Why Simplicity Wins in UX Design",
            date: "Oct 25, 2025",
            readingTime: "3 min read",
        },
    ];

    const published = [
        { id: 1, title: "How I Built My Portfolio", date: "Sep 20, 2025" },
    ];

    const submissions = [
        { id: 1, publication: "UX Daily", status: "Pending review" },
        { id: 2, publication: "Tech Insights", status: "Approved" },
    ];


    const tabs = [
        { name: "Drafts", count: drafts.length },
        { name: "Published", count: published.length },
        { name: "Submissions", count: submissions.length },
    ];


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="max-w-5xl mx-auto relative">
            <h1 className="text-3xl font-semibold mb-6">Stories</h1>

            <div className="flex space-x-6 border-b border-gray-200 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`pb-2 text-sm font-medium ${activeTab === tab.name
                            ? "border-b-2 border-black text-black"
                            : "text-gray-500 hover:text-black"
                            }`}
                    >
                        {tab.name} ({tab.count})
                    </button>
                ))}
            </div>

            {activeTab === "Drafts" && (
                <div>
                    {drafts.map((d) => (
                        <div
                            key={d.id}
                            className="flex justify-between items-center border-b border-gray-200 py-4 relative"
                        >
                            <div>
                                <h3 className="font-medium text-lg">{d.title}</h3>
                                <p className="text-gray-500 text-sm">
                                    {d.date} · {d.readingTime}
                                </p>
                            </div>

                            <div ref={menuRef}>
                                <button
                                    onClick={() => setMenuOpen(menuOpen === d.id ? null : d.id)}
                                    className="p-2 rounded-full hover:bg-gray-100"
                                >
                                    <HiOutlineDotsHorizontal size={20} />
                                </button>

                                {menuOpen === d.id && (
                                    <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-md z-10 w-36 text-sm">
                                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                            Edit
                                        </button>
                                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                            Publish
                                        </button>
                                        <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "Published" && (
                <div>
                    {published.map((p) => (
                        <div
                            key={p.id}
                            className="flex justify-between items-center border-b border-gray-200 py-4"
                        >
                            <div>
                                <h3 className="font-medium text-lg">{p.title}</h3>
                                <p className="text-gray-500 text-sm">{p.date}</p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <BsStarFill className="text-yellow-500" />
                                        {p.reactions ?? 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <BsChat />
                                        {p.comments ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "Submissions" && (
                <div className="mt-8 relative">
                    <div className="flex justify-between text-sm text-gray-500 pb-2 relative">
                        <span>Latest</span>
                        <div className="flex space-x-24 items-center">
                            <span>Publication</span>
                            <button
                                className="flex items-center space-x-1"
                                onClick={onToggleStatusFilter}
                            >
                                <span>Status</span>
                                <span>▼</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-4">
                        {submissions.map((s) => (
                            <div
                                key={s.id}
                                className="flex justify-between border-b border-gray-200 py-3"
                            >
                                <span>{s.publication}</span>
                                <span className="text-gray-600">{s.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
