import { RxAvatar } from "react-icons/rx";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";
import { Link } from "react-router";

const Profile = () => {
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
  //         const { data, error } = await supabase
  //             .from("reading_list")
  //             .select(`
  //                     id,
  //                     post:post_id (
  //                         id,
  //                         title,
  //                         slug,
  //                         coverimageurl,
  //                         updatedat,
  //                         user :user_id (
  //                         username
  //                         ),
  //                         publication:publication_id (
  //                         name
  //                         )
  //                     )
  //                     `)
  //             .eq("user_id", userId);
  
  //         if (error) {
  //             console.error("Error fetching reading list:", error);
  //         } else {
  //             // Mỗi item có post.user và post.publication
  //             console.log("Reading list:", data);
  //             setReadingList(data.map((item) => item.post));
  //         }
  //     }

  return (
    <div className="grid grid-cols-[1fr_auto] gap-12">
      <div className="p-6 lg:pl-32 transition-all duration-300 z-10">
        <div className="py-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-8 md:hidden">
              {profile.avatarurl ? (
                <img
                  src={profile.avatarurl}
                  alt="Avatar"
                  className="w-16 h-16 object-cover rounded-full"
                />
              ) : (
                <RxAvatar className="w-16 h-16 object-cover rounded-full text-black" />
              )
              }
              <h5 className="my-2 font-bold text-xl">{profile.name}</h5>
            </div>

            <h1 className="font-bold text-4xl mb-12 max-md:hidden">
              {profile.name}'s Reading List
            </h1>

              <div className="space-y-8">
                {readingList.map((post) => (
                    <div
                        key={post.id}
                        className="flex flex-col md:flex-row justify-between border-b border-gray-100 pb-6"
                    >
                        <div className="flex-1 pr-4">
                            <p className="text-sm text-gray-500 mb-1">
                                In{" "}
                                <span className="font-semibold">
                                    {post.publication?.name || "Independent"}
                                </span>{" "}
                                by {post.user?.username || "Unknown"}
                            </p>

                            <a
                                href={`/posts/${post.slug}`}
                                className="block text-xl font-bold text-gray-900 hover:underline"
                            >
                                {post.title}
                            </a>

                            <span className="text-gray-700 text-sm mt-1">
                                {post.updatedat
                                    ? new Date(post.updatedat).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })
                                    : ""}
                            </span>

                        </div>

                        {post.coverImageUrl && (
                            <img
                                src={post.coverImageUrl}
                                alt={post.title}
                                className="w-40 h-28 object-cover rounded-md mt-4 md:mt-0"
                            />
                        )}
                    </div>
                ))}

            </div>
          </div>
        </div>
      </div>

      <div className="max-md:hidden top-14 right-0 h-[calc(100%-56px)] w-64 lg:w-96 bg-300 border-l border-gray-200 p-4">
        <div className="mx-2 my-3 flex flex-col items-start">
          {profile.avatarurl ? (
            <img
              src={profile.avatarurl}
              alt="Avatar"
              className="w-16 h-16 object-cover rounded-full"
            />
          ) : (
            <RxAvatar className="w-16 h-16 object-cover rounded-full text-black" />
          )
          }
          <h5 className="my-2 bold">{profile.name}</h5>
          <h5 className="mb-2 text-gray-600">0 followers</h5>
          <p className="text-xs text-gray-600">{profile.bio}</p>
          <Link
            to="/profile/edit"
            className="mt-7 text-sm text-green-700 cursor-pointer hover:text-violet-900"
          >
            Edit Profile
          </Link>
          <button
            href="#"
            className="bg-black mt-7 px-4 py-2 text-sm text-white rounded-2xl cursor-pointer"
          >
            Follow
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
