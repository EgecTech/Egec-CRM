import LoginLayout from "@/components/LoginLayout";
import Specialization from "@/components/specialization";
import { LiaUniversitySolid } from "react-icons/lia";

export default function AddSpecialization() {
  return (
    <LoginLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Add <span className="text-indigo-600">Specialization</span>
            </h1>
            <p className="text-sm text-gray-500">ADMIN PANEL</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LiaUniversitySolid className="text-lg" />
            <span>/ Add Specialization</span>
          </div>
        </div>

        <div className="">
          <Specialization />
        </div>
      </div>
    </LoginLayout>
  );
}
