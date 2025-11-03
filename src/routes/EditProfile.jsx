import { RxAvatar } from "react-icons/rx";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

const EditProfile = () => {
  const [profile, setProfile] = useState({
    name: "userName",
    avatarurl: null,
    bio: "text"
  });
  const [readingList, setReadingList] = useState([]);

  // //fake userId, useParam later
  // const userId = 1;

  // useEffect(() => {
  //   fetchProfile();
  //   fetchReadingList();
  // }, []);

  // async function fetchProfile() {
  //   const { data, error } = await supabase
  //     .from("profile")
  //     .select("name, avatarurl, bio")
  //     .eq("user_id", userId)
  //     .single();

  //   if (!error && data) {
  //     setProfile(data);
  //   } else {
  //     console.error("Error fetching profile:", error);
  //   }
  // }

  // async function fetchReadingList() {
  //   const { data, error } = await supabase
  //     .from("reading_list")
  //     .select(`
  //               id,
  //               post:post (
  //                 id,
  //                 title,
  //                 slug
  //               ) 
  //             `)
  //     .eq("user_id", 1);

  //   if (error) {
  //     console.error("Error fetching reading list:", error);
  //   } else {
  //     setReadingList(data.map((item) => item.post));
  //   }
  // }

  return (
    <div className="px-16 py-8 container">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 pb-2">
        Profile Information
      </h1>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10">
        {/* Avatar Section */}
        <div className="relative group">
          {profile.avatarurl ? (
            <img
              src={profile.avatarurl}
              alt="Avatar"
              className="w-32 h-32 object-cover rounded-full ring-4 ring-blue-200 group-hover:ring-blue-400 transition duration-300"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 ring-4 ring-blue-200 group-hover:ring-blue-400 transition duration-300">
              <RxAvatar className="w-20 h-20" />
            </div>
          )}

          <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer text-xs font-medium">
            <input
              type="file"
              accept="image/*"
              className="hidden"
            // onChange={handleFileChange}
            />
            Change Img
          </label>
        </div>

        {/* Info Section */}
        <div className="flex-1 w-full space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              id="name"
              type="text"
              // value={name}
              // onChange={(e) => setName(e.target.value)}
              className="bg-gray-100 mt-1 w-full border border-gray-300 px-4 py-2 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio (About Me)
            </label>
            <textarea
              id="bio"
              // value={bio}
              // onChange={(e) => setBio(e.target.value)}
              className="bg-gray-100 mt-1 w-full border border-gray-300 px-4 py-2 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none"
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>
      <button className="w-full bg-blue-600 text-white font-semibold tracking-wide px-4 py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md">
        Save Changes
      </button>
    </div>
  );
};

export default EditProfile;
