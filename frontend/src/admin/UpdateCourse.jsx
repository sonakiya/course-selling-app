import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Backend_URL } from "../utils/utils";

function UpdateCourse() {
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const { data } = await axios.get(
          `${Backend_URL}/course/${id}`,
          { withCredentials: true }
        );
        console.log(data);
        setTitle(data.course.title);
        setDescription(data.course.description);
        setPrice(data.course.price);
        setImagePreview(data.course.image.url);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch course data");
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  // Handle Image Change
  const changePhotoHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagePreview(reader.result);
      setImage(file);
    };
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    if (image) {
      formData.append("image", image); // ✅ Corrected image field
    }

    const admin = JSON.parse(localStorage.getItem("admin"));
    const token = admin?.token;
    if (!token) {
      toast.error("Please login as an admin");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:4001/api/v1/course/update/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // ✅ Required for file upload
          },
          withCredentials: true,
        }
      );
      toast.success(response.data.message || "Course updated successfully");
      navigate("/admin/our-courses"); // ✅ Redirect after successful update
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.errors || "Error updating course");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto p-6 border rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-8">Update Course</h3>
        <form onSubmit={handleUpdateCourse} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-lg">Title</label>
            <input
              type="text"
              placeholder="Enter your course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg">Description</label>
            <input
              type="text"
              placeholder="Enter your course description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg">Price</label>
            <input
              type="number"
              placeholder="Enter your course price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg">Course Image</label>
            <div className="flex items-center justify-center">
              <img
                src={imagePreview || "/imgPL.webp"}
                alt="Course"
                className="w-full max-w-sm h-auto rounded-md object-cover"
              />
            </div>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={changePhotoHandler}
              className="w-full px-3 py-2 border border-gray-400 rounded-md outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
          >
            Update Course
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateCourse;
