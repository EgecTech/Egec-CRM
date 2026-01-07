import Degree from "@/components/Degree";
import LoginLayout from "@/components/LoginLayout";

import { LiaUniversitySolid } from "react-icons/lia";

export default function adddegree() {
  return (
    <>
      <LoginLayout>
        <div className="addblogspage">
          <div className="titledashboard flex flex-sb items-center">
            <div>
              <h2>
                Add <span>Degree</span>
              </h2>
              <h3>ADMIN PANEL</h3>
            </div>
            <div className="breadcrumb">
              <LiaUniversitySolid /> <span>/</span>
              <span>Add Degree</span>
            </div>
          </div>
          <div className="blogsadd">
            <Degree />
          </div>
        </div>
      </LoginLayout>
    </>
  );
}
