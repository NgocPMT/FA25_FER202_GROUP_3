import { RxAvatar } from "react-icons/rx";

const Profile = () => {
  const userName = "userName";
  const bio = "text";
  const readingList = null;

  return (
    <div className="grid grid-cols-[1fr_auto] gap-12">
      <div className="p-6 lg:pl-32 transition-all duration-300 z-10">
        <div className="py-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-8 md:hidden">
              <RxAvatar className="w-16 h-16 object-cover rounded-full text-black" />
              <h5 className="my-2 font-bold text-xl">{userName}</h5>
            </div>
            <h1 className="font-bold text-4xl mb-12 max-md:hidden">
              {userName}
            </h1>
            <a
              href="#"
              className="block p-4 border border-gray-200 bg-gray-100 rounded-lg hover:bg-gray-200 transition max-w-xl"
            >
              <h2 className="text-xl font-bold mb-4">Reading list</h2>
              <div>
                {readingList && readingList.length > 0 ? (
                  <p className="text-gray-600">
                    {readingList[0]}, {readingList[1]}, {readingList[2]},...
                  </p>
                ) : (
                  <p className="text-gray-600">
                    You have no items in your reading list.
                  </p>
                )}
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="max-md:hidden top-14 right-0 h-[calc(100%-56px)] w-64 lg:w-96 bg-300 border-l border-gray-200 p-4">
        <div className="">
          <div className="mx-2 my-3 flex flex-col items-start">
            <RxAvatar className="w-20 h-20 object-cover rounded-full text-black" />
            <h5 className="my-2">{userName}</h5>
            <p className="text-xs text-gray-600">{bio}</p>
            <a
              href="#"
              className="mt-7 text-sm text-green-700 cursor-pointer hover:text-violet-900"
            >
              Edit Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
