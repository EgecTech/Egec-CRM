import { signOut } from "next-auth/react";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineAccountCircle } from "react-icons/md";

export default function Setting() {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* العنوان العلوي */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Admin <span className="text-blue-600">Settings</span>
            </h2>
            <h3 className="text-gray-600 text-sm">ADMIN PANEL</h3>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <IoSettingsOutline className="text-xl" />
            <span>/</span>
            <span>Setting</span>
          </div>
        </div>

        {/* قسم الإعدادات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* البطاقة الشخصية */}
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <img
                src="/img/egeclogo.jpg"
                alt="Coder"
                className="w-28 h-28 rounded-full border-4 border-gray-300 shadow-lg"
              />

              <h2 className="text-lg font-semibold mt-4">My Profile</h2>
              <h3 className="text-gray-600">
                Developer team <br /> Web Developer
              </h3>
            </div>
            <div className="mt-6 text-left">
              <label className="block text-gray-700 mb-1">Phone:</label>
              <input
                type="text"
                defaultValue={"+20 1062804433"}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mt-4 text-left">
              <label className="block text-gray-700 mb-1">Email:</label>
              <input
                type="email"
                defaultValue={"egecmarket@gmail.com"}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mt-6">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
                Save
              </button>
            </div>
          </div>

          {/* قسم الحساب */}
          <div className="bg-gray-100 p-6 rounded-lg flex flex-col justify-between items-center">
            <h2 className="flex justify-between items-center text-lg font-semibold">
              My Account
              <MdOutlineAccountCircle className="text-2xl text-gray-700" />
            </h2>
            <hr className="my-4" />
            <div className="flex justify-between items-center w-full">
              <h2 className="text-gray-700">
                Active Account <br />{" "}
                <span className="text-sm text-gray-500">Email</span>
              </h2>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
