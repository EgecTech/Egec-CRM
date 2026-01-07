// pages/index.js
import Head from "next/head";
import { Bar } from "react-chartjs-2";
import Loading from "@/components/Loading";
import { IoHome } from "react-icons/io5";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import { plugin } from "mongoose";
import LoginLayout from "@/components/LoginLayout";

export default function Home() {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  const [projectData, setProjectData] = useState([]);
  const [universityData, setUniversityData] = useState([]);
  const [loading, setLoading] = useState(true);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Blog Created Monthly by Year",
      },
    },
  };

  useEffect(() => {
    document.body.style.zoom = "90%"; // ضبط التكبير/التصغير إلى 90%
  }, []);

  // useEffect(() => {
  // document.body.style.transform = "scale(0.9)"; // Adjusts zoom to 90%
  // document.body.style.transformOrigin = "0 0"; // Ensures zoom starts from top-left corner
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseproject = await fetch("/api/projects");
        const responseuniversity = await fetch(
          "/api/universities/universities"
        );
        const dataProject = await responseproject.json();
        const dataUniversity = await responseuniversity.json();

        setProjectData(dataProject);
        setUniversityData(dataUniversity);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // published unversity
  // const monthlyData = universityData
  //   .filter((dat) => dat.status === "publish")
  //   .reduce((acc, blog) => {
  //     const year = new Date(blog.createdAt).getFullYear();
  //     const month = new Date(blog.createdAt).getMonth();
  //     acc[year] = acc[year] || Array(12).fill(0);
  //     acc[year][month]++;
  //     return acc;
  //   }, {});
  const monthlyData = universityData
    .filter((dat) => dat.status)
    .reduce((acc, blog) => {
      const year = new Date(blog.createdAt).getFullYear();
      const month = new Date(blog.createdAt).getMonth();
      acc[year] = acc[year] || Array(12).fill(0);
      acc[year][month]++;
      return acc;
    }, {});

  const currentYear = new Date().getFullYear();
  const years = Object.keys(monthlyData);
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const datasets = years.map((year) => ({
    label: `${year}`,
    data: monthlyData[year] || Array(12).fill(0),
    // backgroundColor: "rgba(255,0,0,0.5)",
    backgroundColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
      Math.random() * 256
    )},${Math.floor(Math.random() * 256)})`,
  }));

  const data = {
    labels,
    datasets,
  };

  return (
    <LoginLayout>
      <>
        <div className="dashboard">
          <div className="titledashboard flex flex-sb items-center">
            <div>
              <h2>
                Admin <span>Dashboard</span>
              </h2>
              <h3>ADMIN PANEL</h3>
            </div>
            <div className="breadcrumb">
              <IoHome /> <span>/</span>
              <span>Dashboard</span>
            </div>
          </div>

          <div className="topfourcards flex flex-wrap justify-between items-center">
            <div className="four_card">
              <h2>Total Countries</h2>
              <span>
                {projectData.filter((dat) => dat.status === "publish").length}
              </span>
            </div>
            <div className="four_card">
              <h2>Total Universities</h2>
              <span>{universityData.filter((dat) => dat).length}</span>
            </div>
            <div className="four_card">
              <h2>Total Colleges</h2>
              <span>
                {projectData.filter((dat) => dat.status === "publish").length}
              </span>
            </div>
            <div className="four_card">
              <h2>Total Specialties</h2>
              <span>
                {projectData.filter((dat) => dat.status === "publish").length}
              </span>
            </div>
          </div>

          <div className="year_overview flex flex-sb items-center">
            <div className="leftyearoverview">
              <div className="flex flex-sb items-center">
                <h3>Year Overview</h3>
                <ul className="creative-dots">
                  <li className="big-dot"></li>
                  <li className="semi-big-dot"></li>
                  <li className="medium-dot"></li>
                  <li className="semi-medium-dot"></li>
                  <li className="semi-small-dot"></li>
                  <li className="small-dot"></li>
                </ul>
                <h3 className="text-right">
                  10/ 365 <br /> <span>Total Published </span>
                </h3>
              </div>
              <Bar data={data} options={options} />
            </div>

            <div className="right_salescont">
              <div>
                <h3>التخصصات</h3>
                <ul className="creative-dots">
                  <li className="big-dot"></li>
                  <li className="semi-big-dot"></li>
                  <li className="medium-dot"></li>
                  <li className="semi-medium-dot"></li>
                  <li className="semi-small-dot"></li>
                  <li className="small-dot"></li>
                </ul>
              </div>
              <div className="blogscategory flex flex-center items-center">
                <table>
                  <thead>
                    <tr>
                      <td>Topics</td>
                      <td>Data</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>تخصص 1</td>
                      <td>
                        {
                          universityData.filter(
                            (dat) => dat.country === "Node Js"
                          ).length
                        }
                      </td>
                    </tr>
                    <tr>
                      <td> تخصص 2</td>
                      <td>
                        {
                          universityData.filter(
                            (dat) => dat.country === "React Js"
                          ).length
                        }
                      </td>
                    </tr>
                    <tr>
                      <td> تخصص 2</td>
                      <td>
                        {
                          universityData.filter(
                            (dat) => dat.country === "Next Js"
                          ).length
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>تخصص 3</td>
                      <td>
                        {
                          universityData.filter((dat) => dat.country === "Css")
                            .length
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>تخصص 4 </td>
                      <td>
                        {
                          universityData.filter(
                            (dat) => dat.country === "Digital Marketing"
                          ).length
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>تخصص 5 </td>
                      <td>
                        {
                          universityData.filter(
                            (dat) => dat.country === "Flutter Dev"
                          ).length
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>تخصص 6</td>
                      <td>
                        {
                          universityData.filter(
                            (dat) => dat.country === "Database"
                          ).length
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>تخصص 7</td>
                      <td>
                        {
                          universityData.filter(
                            (dat) => dat.country === "Deployment"
                          ).length
                        }
                      </td>
                    </tr>
                    <tr>
                      <td> تخصص 8</td>
                      <td>
                        {
                          universityData.filter(
                            (dat) => dat.country === "Next Js"
                          ).length
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </>
    </LoginLayout>
  );
}
