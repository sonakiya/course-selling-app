import React, { useEffect, useState } from 'react'
import logo from "../../public/logo.webp"
import { Link } from "react-router-dom"
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import axios from "axios"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import toast from 'react-hot-toast';

function Home() {
  const [courses, setCourses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on page load
  useEffect(() => {
    const token = localStorage.getItem("user");
    setIsLoggedIn(!!token); // Convert token existence to boolean (true/false)
  }, []);

  // Logout user
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:4001/api/v1/user/logout", {
        withCredentials: true
      });
      toast.success("Logged out successfully");

      localStorage.removeItem("user");  // REMOVE TOKEN FROM STORAGE
      setIsLoggedIn(false);  // Update state
    } catch (error) {
      console.log("Error in logout", error);
      toast.error(error.response?.data?.errors || "Error in logging out");
    }
  };

  // Fetch courses from the backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:4001/api/v1/course/courses", {
          withCredentials: true, // Access cookies/tokens
        });
        console.log(response.data.courses);
        setCourses(response.data.courses);
      } catch (error) {
        console.log("Error in fetching courses", error);
      }
    };
    fetchCourses();
  }, []);

  // React Slick Slider Config
  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 2, infinite: true, dots: true } },
      { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2, initialSlide: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  };

  return (
    <div className="bg-gradient-to-r from-black to-blue-950 ">
      <div className='h-[1250px] md:h-[1050px] text-white container mx-auto'>

        {/* Header */}
        <header className='flex items-center justify-between p-6 '>
          <div className='flex items-center space-x-2'> 
            <img src={logo} alt="Logo" className='w-10 h-10 rounded-full' />
            <h1 className='text-2xl text-orange-500 font-bold'>AyuVersity</h1>
          </div>
          <div className='space-x-4'>
            {isLoggedIn ? (
              <button onClick={handleLogout} className='bg-transparent text-white py-2 px-4 border border-white rounded hover:border-orange-500 hover:text-orange-500'>
                Logout
              </button>
            ) : (
              <>
                <Link to={"/login"} className='bg-transparent text-white py-2 px-4 border border-white rounded hover:border-orange-500 hover:text-orange-500'>
                  Login
                </Link>
                <Link to={"/signup"} className='bg-transparent text-white py-2 px-4 border border-white rounded hover:border-orange-500 hover:text-orange-500'>
                  Signup
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Main Section */}
        <section className='text-center py-20'>
          <h1 className='text-4xl font-semibold text-orange-500'>AyuVersity</h1>
          <p className='text-gray-500'>Sharpen your skills with the courses crafted by experts</p>
          <div className='space-x-4 mt-8'>
            <Link to={"/courses"} className='bg-green-500 py-3 px-6 text-white rounded font-semibold hover:bg-orange-500 duration-300 hover:text-black'>
              Explore Courses
            </Link>
            <Link to={"https://www.youtube.com/@ApnaCollegeOfficial/playlists"} className='bg-white py-3 px-6 text-black rounded font-semibold hover:bg-orange-500 duration-300 hover:text-white '>
              Course Videos
            </Link>
          </div>
        </section>

        {/* Course Slider */}
        <section className='mb-16'>
          <Slider {...settings}>
            {courses.map((course) => (
              <div key={course._id} className='p-4'>
                <div className='relative flex-shrink-0 w-92 transition-transform duration-300 transform hover:scale-105'>
                  <div className='bg-gray-900 rounded-lg overflow-hidden'>
                    <img className='h-32 w-full object-contain' src={course.image.url} alt="Course" />
                    <div className='p-6 text-center'>
                      <h2 className='text-xl font-bold text-white'>{course.title}</h2>
                      <button className='mt-4 bg-orange-500 text-white py-2 px-4 rounded-full hover:bg-blue-500 duration-300'>
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section>

        <hr />

        {/* Footer */}
        <footer className='mt-28 ml-36'>
          <div className='grid grid-cols-1 md:grid-cols-3'>
            <div className='flex flex-col items-center md:items-start'>
              <div className='flex items-center space-x-2 '> 
                <img src={logo} alt="Logo" className='w-10 h-10 rounded-full' />
                <h1 className='text-2xl text-orange-500 font-bold'>AyuVersity</h1>
              </div>
              <div className='mt-3 ml-3 md:ml-8'>
                <p className='mb-2'>Follow us</p>
                <div className='flex space-x-4'>
                  <a href="#"><FaFacebook className='text-2xl hover:text-blue-400 duration-300'/></a>
                  <a href="#"><FaInstagram className='text-2xl hover:text-pink-600 duration-300'/></a>
                  <a href="#"><FaTwitter className='text-2xl hover:text-blue-600 duration-300'/></a>
                </div>
              </div>
            </div>
            <div>
              <h3>Connect with us</h3>
              <ul className='space-y-2 text-gray-400'>
                <li className='hover:text-orange-500 cursor-pointer duration-300'><a href="#">Telegram</a></li>
                <li className='hover:text-orange-500 cursor-pointer duration-300'><a href="#">YouTube</a></li>
                <li className='hover:text-orange-500 cursor-pointer duration-300'><a href="#">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h3>© 2025 AyuVersity</h3>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Home;
