import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Backend_URL } from "../utils/utils";

function OurCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem("admin"));
  const token = admin?.token;

  if (!token) {
    toast.error("Please login to admin");
    navigate("/admin/login");
  }

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${Backend_URL}/course/courses`, {
          withCredentials: true,
        });
        setCourses(response.data.courses);
        setLoading(false);
      } catch (error) {
        console.log("Error in fetchCourses ", error);
      }
    };
    fetchCourses();
  }, []);

  // Delete courses
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${Backend_URL}/course/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      setCourses((prevCourses) => prevCourses.filter((course) => course._id !== id));
    } catch (error) {
      console.log("Error in deleting course ", error);
      toast.error(error.response?.data?.errors || "Error in deleting course");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="bg-gray-100 p-8 space-y-4">
      <h1 className="text-3xl font-bold text-center mb-8">Our Courses</h1>
      <Link
        className="bg-orange-400 py-2 px-4 rounded-lg text-white hover:bg-orange-950 duration-300"
        to={"/admin/dashboard"}
      >
        Go to Dashboard
      </Link>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const discountPercent = 10; // Set discount percentage
          const originalPrice = Math.round(course.price / (1 - discountPercent / 100)); // Calculate original price

          return (
            <div key={course._id} className="bg-white shadow-md rounded-lg p-4">
              {/* Course Image */}
              <div className="h-40 w-full overflow-hidden rounded-t-lg">
                <img
                  src={course?.image?.url}
                  alt={course.title}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Course Title */}
              <h2 className="text-xl font-semibold mt-4 text-gray-800">{course.title}</h2>
              {/* Course Description */}
              <p className="text-gray-600 mt-2 text-sm">
                {course.description.length > 200
                  ? `${course.description.slice(0, 200)}...`
                  : course.description}
              </p>
              {/* Course Price */}
              <div className="flex justify-between mt-4 text-gray-800 font-bold">
                <div>
                  ₹{course.price}{" "}
                  <span className="line-through text-gray-500">₹{originalPrice}</span>
                </div>
                <div className="text-green-600 text-sm mt-2">{discountPercent}% off</div>
              </div>

              <div className="flex justify-between">
                <Link
                  to={`/admin/update-course/${course._id}`}
                  className="bg-orange-500 text-white py-2 px-4 mt-4 rounded hover:bg-blue-600"
                >
                  Update
                </Link>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="bg-red-500 text-white py-2 px-4 mt-4 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OurCourses;
