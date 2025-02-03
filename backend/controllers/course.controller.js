import { Course } from "../modals/course.modals.js";
import { v2 as cloudinary } from "cloudinary";
import { Purchase } from "../modals/purchase.model.js";

// ✅ CREATE COURSE
export const createCourse = async (req, res) => {
  const adminId = req.adminId;
  const { title, description, price } = req.body;

  try {
    if (!title || !description || !price) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const { image } = req.files;
    const allowedFormats = ["image/png", "image/jpeg"];

    if (!allowedFormats.includes(image.mimetype)) {
      return res.status(400).json({ error: "Invalid file format. Only PNG and JPG allowed." });
    }

    // 🔥 Upload Image to Cloudinary
    const cloudResponse = await cloudinary.uploader.upload(image.tempFilePath);
    if (!cloudResponse || cloudResponse.error) {
      return res.status(400).json({ error: "Error uploading file to Cloudinary" });
    }

    // ✅ Save Course Data
    const course = await Course.create({
      title,
      description,
      price,
      image: {
        public_id: cloudResponse.public_id,
        url: cloudResponse.url,
      },
      creatorId: adminId,
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Error creating course" });
  }
};

// ✅ UPDATE COURSE
export const updateCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;
  const { title, description, price } = req.body;

  try {
    const course = await Course.findOne({ _id: courseId, creatorId: adminId });

    if (!course) {
      return res.status(404).json({ errors: "Course not found or unauthorized" });
    }

    let newImageData = course.image; // Default to existing image

    if (req.files && req.files.image) {
      const { image } = req.files;
      const allowedFormats = ["image/png", "image/jpeg"];

      if (!allowedFormats.includes(image.mimetype)) {
        return res.status(400).json({ error: "Invalid file format. Only PNG and JPG allowed." });
      }

      // 🔥 Upload New Image to Cloudinary
      const cloudResponse = await cloudinary.uploader.upload(image.tempFilePath);

      if (!cloudResponse || cloudResponse.error) {
        return res.status(400).json({ error: "Error uploading file to Cloudinary" });
      }

      // 🔥 Delete Old Image from Cloudinary
      if (course.image && course.image.public_id) {
        await cloudinary.uploader.destroy(course.image.public_id);
      }

      // ✅ Set New Image Data
      newImageData = {
        public_id: cloudResponse.public_id,
        url: cloudResponse.url,
      };
    }

    // ✅ Update Course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { title, description, price, image: newImageData },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ errors: "Failed to update course, created by other admin" });
    }

    res.status(200).json({ message: "Course updated successfully", course: updatedCourse });
  } catch (error) {
    console.error("Error in course updating:", error);
    res.status(500).json({ errors: "Error in course updating" });
  }
};

// ✅ DELETE COURSE
export const deleteCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;

  try {
    const course = await Course.findOneAndDelete({ _id: courseId, creatorId: adminId });

    if (!course) {
      return res.status(404).json({ errors: "can't delete, created by other admin" });
    }

    // 🔥 Delete Image from Cloudinary
    if (course.image && course.image.public_id) {
      await cloudinary.uploader.destroy(course.image.public_id);
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error in course deleting:", error);
    res.status(500).json({ errors: "Error in course deleting" });
  }
};

// ✅ GET ALL COURSES
export const getCourse = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error in getting courses:", error);
    res.status(500).json({ errors: "Error in getting courses" });
  }
};

// ✅ GET COURSE DETAILS
export const courseDetails = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ course });
  } catch (error) {
    console.error("Error in course details:", error);
    res.status(500).json({ errors: "Error in course details" });
  }
};

// ✅ BUY COURSE (Stripe Payment)
import Stripe from "stripe";
import config from "../config.js";
const stripe = new Stripe(config.STRIPE_SECRET_KEY);

export const buyCourses = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ errors: "Course not found" });
    }

    const existingPurchase = await Purchase.findOne({ userId, courseId });

    if (existingPurchase) {
      return res.status(400).json({ errors: "User has already purchased this course" });
    }

    // 🔥 Create Stripe Payment Intent
    const amount = course.price * 100; // Convert to cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    if (!paymentIntent.client_secret) {
      return res.status(500).json({ errors: "Stripe payment error: client_secret missing" });
    }

    res.status(201).json({
      message: "Course purchased successfully...",
      course,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error in buying course:", error);
    res.status(500).json({ errors: "Error in buying course" });
  }
};
