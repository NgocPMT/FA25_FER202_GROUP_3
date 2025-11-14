import { RxAvatar } from "react-icons/rx";
import { Link } from "react-router-dom";

const SidebarProfile = ({ profile, follower, isFollowing, toggleFollow, username }) => {
  const usernameToken = localStorage.getItem("username");
  const userAccount = username === usernameToken ? null : username;

  return (
    <div className="max-md:hidden top-14 right-0 h-[calc(100%-56px)] w-64 lg:w-96 border-l border-gray-200 p-4">
      <div className="mx-2 my-3 flex flex-col items-start">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt="Avatar"
            className="w-16 h-16 object-cover rounded-full"
          />
        ) : (
          <RxAvatar className="w-16 h-16 text-black" />
        )}

        <h5 className="my-2 font-bold">{profile.name}</h5>
        <h5 className="mb-2 text-gray-600">{follower} followers</h5>
        <p className="text-xs text-gray-600">{profile.bio}</p>

        {userAccount ? (
          <button
            onClick={toggleFollow}
            className={`mt-7 px-4 py-2 text-sm rounded-2xl cursor-pointer transition 
            ${isFollowing
                ? "bg-white border border-gray-300 text-black hover:bg-gray-100"
                : "bg-black text-white hover:opacity-80"}`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        ) : (
          <Link
            to="/profile/edit"
            className="mt-7 text-sm text-green-700 hover:text-violet-900"
          >
            Edit Profile
          </Link>
        )}
      </div>
    </div>
  );
};

export default SidebarProfile;
