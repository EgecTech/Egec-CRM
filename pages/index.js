// pages/index.js
import Head from "next/head";
import dynamic from "next/dynamic";
import Loading from "@/components/Loading";
import { IoHome } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import LoginLayout from "@/components/LoginLayout";

// Lazy load heavy chart components
const BarChart = dynamic(
  async () => {
    const chartModule = await import("chart.js");
    const reactChartModule = await import("react-chartjs-2");

    const ChartJS = chartModule.Chart;
    const { CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } =
      chartModule;

    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend
    );

    return reactChartModule.Bar;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-gray-100 animate-pulse rounded flex items-center justify-center">
        <Loading />
      </div>
    ),
  }
);

const DoughnutChart = dynamic(
  async () => {
    const chartModule = await import("chart.js");
    const reactChartModule = await import("react-chartjs-2");

    const ChartJS = chartModule.Chart;
    const { ArcElement, Title, Tooltip, Legend } = chartModule;

    ChartJS.register(ArcElement, Title, Tooltip, Legend);

    return reactChartModule.Doughnut;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-gray-100 animate-pulse rounded flex items-center justify-center">
        <Loading />
      </div>
    ),
  }
);

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projectData, setProjectData] = useState([]);
  const [universityData, setUniversityData] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");

  useEffect(() => {
    // Don't fetch data if user is not authenticated
    if (status === "loading") {
      return;
    }

    if (!session) {
      // LoginLayout will handle redirect, but we should still set loading to false
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [projectRes, universityRes, specRes, collegesRes] =
          await Promise.all([
            fetch("/api/projects"),
            fetch("/api/universities/universities"),
            fetch("/api/specializations"),
            fetch("/api/colleges"),
          ]);

        // Handle authentication errors gracefully
        if (
          projectRes.status === 401 ||
          projectRes.status === 403 ||
          universityRes.status === 401 ||
          universityRes.status === 403 ||
          specRes.status === 401 ||
          specRes.status === 403 ||
          collegesRes.status === 401 ||
          collegesRes.status === 403
        ) {
          // Session expired or unauthorized - redirect to sign in
          router.push("/auth/signin");
          return;
        }

        if (
          !projectRes.ok ||
          !universityRes.ok ||
          !specRes.ok ||
          !collegesRes.ok
        ) {
          throw new Error("فشل في جلب البيانات");
        }

        const [projects, universities, specs, collegesData] = await Promise.all(
          [
            projectRes.json(),
            universityRes.json(),
            specRes.json(),
            collegesRes.json(),
          ]
        );

        setProjectData(Array.isArray(projects) ? projects : []);
        setUniversityData(Array.isArray(universities) ? universities : []);
        setSpecializations(Array.isArray(specs) ? specs : []);
        setColleges(Array.isArray(collegesData) ? collegesData : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        // Only set empty arrays if it's not an auth error
        if (err.message !== "فشل في جلب البيانات" || err.status !== 401) {
          setProjectData([]);
          setUniversityData([]);
          setSpecializations([]);
          setColleges([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, status, router]);

  // Filter data based on selected time range
  const filterDataByTimeRange = (data) => {
    const now = new Date();
    const ranges = {
      week: new Date(now.setDate(now.getDate() - 7)),
      month: new Date(now.setMonth(now.getMonth() - 1)),
      year: new Date(now.setFullYear(now.getFullYear() - 1)),
      all: new Date(0),
    };
    return data.filter(
      (item) => new Date(item.createdAt) >= ranges[selectedTimeRange]
    );
  };

  const filteredUniversityData = filterDataByTimeRange(universityData);
  const filteredProjectData = filterDataByTimeRange(projectData);
  const filteredSpecializations = filterDataByTimeRange(specializations);
  const filteredColleges = filterDataByTimeRange(colleges);

  const publishedUniversities = filteredUniversityData.filter(
    (u) => u.status === "publish"
  );
  const draftUniversities = filteredUniversityData.filter(
    (u) => u.status !== "publish"
  );
  const totalCountries = new Set(filteredUniversityData.map((u) => u.country))
    .size;
  const totalColleges = filteredColleges.length;

  // Top 5 countries by university count
  const countryData = filteredUniversityData.reduce((acc, uni) => {
    acc[uni.country] = (acc[uni.country] || 0) + 1;
    return acc;
  }, {});

  const topCountries = Object.entries(countryData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const barData = {
    labels: topCountries.map(([country]) => country),
    datasets: [
      {
        label: "Universities per Country",
        data: topCountries.map(([, count]) => count),
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Top 5 specializations by places
  const topSpecializations = [...specializations]
    .sort((a, b) => (b.places?.length || 0) - (a.places?.length || 0))
    .slice(0, 5);

  const specData = {
    labels: topSpecializations.map((s) => s.name),
    datasets: [
      {
        label: "Places per Specialization",
        data: topSpecializations.map((s) => s.places?.length || 0),
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusData = {
    labels: ["Published", "Draft"],
    datasets: [
      {
        data: [publishedUniversities.length, draftUniversities.length],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(239, 68, 68, 1)"],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loading />
      </div>
    );
  }

  return (
    <LoginLayout>
      <div className="dashboard p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              Admin <span className="text-indigo-600">Dashboard</span>
            </h2>
            <p className="text-gray-600">Overview and Statistics</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <div className="flex items-center gap-2 text-gray-500">
              <IoHome className="text-xl" /> <span>/ Dashboard</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Countries"
            value={totalCountries}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Universities"
            value={filteredUniversityData.length}
            color="bg-purple-500"
          />
          <StatCard
            title="Published Universities"
            value={publishedUniversities.length}
            color="bg-green-500"
          />
          <StatCard
            title="Total Colleges"
            value={totalColleges}
            color="bg-yellow-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              Top 5 Countries by Universities
            </h3>
            <div className="h-80">
              <BarChart
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              University Status Distribution
            </h3>
            <div className="h-80">
              <DoughnutChart
                data={statusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Top 5 Specializations by Places
          </h3>
          <div className="h-96">
            <BarChart
              data={specData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </LoginLayout>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`text-white p-6 rounded-lg shadow ${color}`}>
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
