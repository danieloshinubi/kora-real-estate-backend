"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const roles_list_1 = __importDefault(require("../config/roles_list"));
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNo: {
        type: String,
        required: true,
    },
    roles: {
        User: {
            type: Number,
            default: roles_list_1.default.User,
        },
        Admin: Number,
        Group_Admin: Number,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    accountDisabled: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        default: null,
    },
}, { timestamps: true });
// Middleware to clear OTP after 2 minutes
userSchema.post('save', function (doc) {
    if (doc.otp) {
        setTimeout(async () => {
            try {
                await mongoose_1.default
                    .model('User')
                    .findByIdAndUpdate(doc._id, { otp: null });
            }
            catch (error) {
                console.error('Error updating otp expiration:', error);
            }
        }, 2 * 60 * 1000);
    }
});
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
