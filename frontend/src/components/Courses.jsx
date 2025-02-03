import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaUserCircle, FaDiscourse, FaDownload } from "react-icons/fa";
import { RiHome2Fill } from "react-icons/ri";
import { IoMdSettings } from "react-icons/io";
import { IoLogIn, IoLogOut } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { HiMenu, HiX } from "react-icons/hi"; // Import menu and close icons
import logo from "../../public/logo.webp";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Backend_URL } from "../utils/utils";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to toggle sidebar

  // Check token to set logged-in state
  useEffect(() => {
    const token = localStorage.getItem("user");
    setIsLoggedIn(!!token);
  }, []);

  // Logout user
  const handleLogout = async () => {
    try {
      await axios.get(`${Backend_URL}/user/logout`, {
        withCredentials: true,
      });
      toast.success("Logged out successfully!");
      setIsLoggedIn(false);
      localStorage.removeItem("user"); // Remove token on logout
    } catch (error) {
      console.error("Error in logout:", error);
      toast.error("Error logging out!");
    }
  };

  // Fetch courses from the backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${Backend_URL}/course/courses`,
          { withCredentials: true }
        );
        setCourses(response.data.courses);
      } catch (error) {
        console.error("Error in fetching courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Toggle sidebar for mobile devices
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Hamburger menu button for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 text-3xl text-gray-800"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <HiX /> : <HiMenu />} {/* Toggle menu icon */}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gray-100 w-64 p-5 transform z-10 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
      >
        <div className="flex items-center mb-10 mt-10 md:mt-0">
          <img src={logo} alt="Profile" className="rounded-full h-12 w-12" />
        </div>
        <nav>
          <ul>
            <li className="mb-4">
              <Link to="/" className="flex items-center">
                <RiHome2Fill className="mr-2" /> Home
              </Link>
            </li>
            <li className="mb-4">
              <Link to="#" className="flex items-center text-blue-500">
                <FaDiscourse className="mr-2" /> Courses
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/purchases" className="flex items-center">
                <FaDownload className="mr-2" /> Purchases
              </Link>
            </li>
            <li className="mb-4">
              <Link to="#" className="flex items-center">
                <IoMdSettings className="mr-2" /> Settings
              </Link>
            </li>
            <li>
              {isLoggedIn ? (
                <button
                  className="flex items-center"
                  onClick={handleLogout}
                >
                  <IoLogOut className="mr-2" /> Logout
                </button>
              ) : (
                <Link to="/login" className="flex items-center">
                  <IoLogIn className="mr-2" /> Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-white p-10">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-xl font-bold">Courses</h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type here to search..."
                className="border border-gray-300 rounded-l-full px-4 py-2 h-10 focus:outline-none"
              />
              <button className="h-10 border border-gray-300 rounded-r-full px-4 flex items-center justify-center">
                <FiSearch className="text-xl text-gray-600" />
              </button>
            </div>
            <FaUserCircle className="text-4xl text-blue-600" />
          </div>
        </header>

        {/* Courses Section */}
        <div>
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : courses.length === 0 ? (
            <p className="text-center text-gray-500">
              No course posted yet by admin
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {courses.map((course) => {
                const discount = 20; // Discount percentage (Can be dynamic)
                const discountedPrice = (
                  course.price - (course.price * discount) / 100
                ).toFixed(2);

                return (
                  <div
                    key={course._id}
                    className="border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col"
                  >
                    {/* Image */}
                    <img
                      src={course.image.url}
                      alt={course.title}
                      className="rounded mb-4 h-40 w-full object-contain"
                    />

                    {/* Title */}
                    <h2 className="font-bold text-lg mb-2">{course.title}</h2>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 flex-grow">
                      {course.description.length > 100
                        ? `${course.description.slice(0, 100)}...`
                        : course.description}
                    </p>

                    {/* Price and Discount */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-xl">
                        ₹{discountedPrice}{" "}
                        <span className="text-gray-500 line-through">
                          ₹{course.price}
                        </span>
                      </span>
                      <span className="text-green-600">{discount}% off</span>
                    </div>

                    {/* Buy Button */}
                    <Link
                      to={`/buy/${course._id}`}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-blue-900 duration-300 mt-auto"
                    >
                      Buy Now
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Courses;
