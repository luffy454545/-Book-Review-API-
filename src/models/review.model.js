const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure one review per user per book
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

// Update book's average rating when a review is created/updated/deleted
reviewSchema.post('save', async function() {
  await this.constructor.updateBookRating(this.bookId);
});

reviewSchema.post('remove', async function() {
  await this.constructor.updateBookRating(this.bookId);
});

// Static method to update book's average rating
reviewSchema.statics.updateBookRating = async function(bookId) {
  const stats = await this.aggregate([
    { $match: { bookId: bookId } },
    {
      $group: {
        _id: '$bookId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Book').findByIdAndUpdate(bookId, {
      averageRating: stats[0].averageRating,
      totalReviews: stats[0].totalReviews
    });
  } else {
    await mongoose.model('Book').findByIdAndUpdate(bookId, {
      averageRating: 0,
      totalReviews: 0
    });
  }
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 