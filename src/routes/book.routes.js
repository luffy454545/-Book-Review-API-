const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Book = require("../models/book.model");
const Review = require("../models/review.model");
const auth = require("../middleware/auth.middleware");

// Validation middleware
const validateBook = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("author").trim().notEmpty().withMessage("Author is required"),
  body("genre").trim().notEmpty().withMessage("Genre is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
];

const validateReview = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment").trim().notEmpty().withMessage("Comment is required"),
];

// Search books
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const books = await Book.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    res.json({
      success: true,
      books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching books",
      error: error.message,
    });
  }
});

// Create a new book (authenticated)
router.post("/", auth, validateBook, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const book = new Book(req.body);
    await book.save();

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating book",
      error: error.message,
    });
  }
});

// Get all books with pagination and filters
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.genre) query.genre = req.query.genre;
    if (req.query.author) query.author = new RegExp(req.query.author, "i");

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching books",
      error: error.message,
    });
  }
});

// Get single book with reviews
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ bookId: book._id })
      .populate("userId", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ bookId: book._id });

    res.json({
      success: true,
      book,
      reviews,
      pagination: {
        page,
        limit,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching book",
      error: error.message,
    });
  }
});

// Add a review to a book (authenticated)
router.post("/:id/reviews", auth, validateReview, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check if user has already reviewed this book
    const existingReview = await Review.findOne({
      bookId: book._id,
      userId: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this book",
      });
    }

    const review = new Review({
      ...req.body,
      bookId: book._id,
      userId: req.user._id,
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding review",
      error: error.message,
    });
  }
});

module.exports = router;
