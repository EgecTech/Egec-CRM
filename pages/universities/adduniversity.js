import LoginLayout from "@/components/LoginLayout";
import University from "@/components/University";
import { LiaUniversitySolid } from "react-icons/lia";

export default function AddUniversity() {
  return (
    <LoginLayout>
      <div className=" px-4 py-6 max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Add <span className="text-indigo-600">University</span>
            </h1>
            <p className="text-sm text-gray-500">ADMIN PANEL</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LiaUniversitySolid className="text-lg" />
            <span>/ Add University</span>
          </div>
        </div>

        <div className="">
          <University />
        </div>
      </div>
    </LoginLayout>
  );
}
