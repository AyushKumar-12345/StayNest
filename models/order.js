const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
    {
        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: true
        },
        buyer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        checkIn: {
            type: Date,
            required: true
        },
        checkOut: {
            type: Date,
            required: true,
            validate: {
                validator: function (value) {
                    return this.checkIn ? value > this.checkIn : true;
                },
                message: "Check-out date must be after check-in date."
            }
        },
        razorpayOrderId: {
            type: String,
            required: true
        },
        razorpayPaymentId: {
            type: String
        },
        status: {
            type: String,
            enum: ["Created", "Paid", "Failed"],
            default: "Created"
        },
        nights: {
            type: Number,
            required: true,
            min: 1
        },
        amountPaid: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);