import { RxAvatar } from "react-icons/rx";
import { useEffect, useState } from "react";

const Library = () => {
    // const [profile, setProfile] = useState({
    //     name: "userName",
    //     avatarurl: null,
    //     bio: "text"
    // });
    // const [readingList, setReadingList] = useState([]);

    // //fake userId, useParam later
    // const userId = 1;

    // useEffect(() => {
    //     fetchProfile();
    //     fetchReadingList();
    // }, []);

    // async function fetchProfile() {
    //     const { data, error } = await supabase
    //         .from("profile")
    //         .select("name, avatarurl, bio")
    //         .eq("user_id", userId)
    //         .single();

    //     if (!error && data) {
    //         setProfile(data);
    //     } else {
    //         console.error("Error fetching profile:", error);
    //     }
    // }

    // async function fetchReadingList() {
    //     const { data, error } = await supabase
    //         .from("reading_list")
    //         .select(`
    //                   id,
    //                   post:post_id (
    //                       id,
    //                       title,
    //                       slug,
    //                       coverimageurl,
    //                       updatedat,
    //                       user :user_id (
    //                       username
    //                       ),
    //                       publication:publication_id (
    //                       name
    //                       )
    //                   )
    //                   `)
    //         .eq("user_id", userId);

    //     if (error) {
    //         console.error("Error fetching reading list:", error);
    //     } else {
    //         // Mỗi item có post.user và post.publication
    //         console.log("Reading list:", data);
    //         setReadingList(data.map((item) => item.post));
    //     }
    // }

    return (
        <div className="max-w-3xl mx-auto py-20 container">
            <div className="flex justify-between items-center mb-16">
                <h1 className="text-4xl font-bold text-gray-800 pb-2">
                    Your Library
                </h1>
                <button className="bg-green-600 text-white px-4 py-2 rounded-3xl">
                    New list
                </button>
            </div>
            <a
              href="#"
              className="block p-4 border border-gray-200 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <h2 className="text-xl font-bold mb-4">Reading list</h2>
              <div>
                  <p className="text-gray-600">
                    You have no items in your reading list.
                  </p>
              </div>
            </a>
        </div>
    );
};

export default Library;
