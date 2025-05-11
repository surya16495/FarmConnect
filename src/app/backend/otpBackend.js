const express = require("express");
const cors = require("cors");
const mongoose=require("mongoose");
const bcrypt = require("bcryptjs");
const nodemailer=require('nodemailer');


const app = express();
const PORT = 5000; // Change this if needed

mongoose.connect("mongodb+srv://chandrasurya121216:JtS08UKYJcIP3Ktq@project-1.vki9g.mongodb.net/agriAppDB?retryWrites=true&w=majority&appName=project-1",{useNewUrlParser:true,useUnifiedTopology:true})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:{type:String,required:true,unique:true},
  contact_number:{type:String ,required: true , unique:true},
  account_type: { type: String, required: true },
  password: { type: String, required: true },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' } // Add this line
    }, {
  toJSON: { virtuals: true },  
  toObject: { virtuals: true }
});
const User = mongoose.model("User", userSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '21jr1a4353@gmail.com',
    pass: 'crhusvuaecyimiub'
  }
});

app.use(express.json());
app.use(cors({origin:"http://localhost:3000",credentials:true,methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']})); 
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

// Temporary storage for OTPs
const otpStorage = {};

// Generate and send OTP
app.post("/send-otp", (req, res) => {
    const { email,name } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    if (name.length==0) {
        return res.status(400).json({ message: "Enter your name" });
    }
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
  }
  

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStorage[email] = otp;

  const mailOptions = {
    from: 'AgriConnect <21jr1a4353@gmail.com>',
    to: email,
    subject: 'Your Secure OTP for Registration - AgriConnect',
    html: `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <div style="text-align: center; border-bottom: 2px solid #2d6a4f; padding-bottom: 15px;">
            <img src="#" alt="AgriConnect Logo" style="height: 50px; margin-bottom: 15px;">
            <h2 style="color: #2d6a4f; margin: 10px 0;">Welcome to AgriConnect!</h2>
        </div>
        
        <div style="padding: 25px 15px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello ${name},<br>
                Thank you for choosing AgriConnect! Here's your One-Time Password (OTP) to complete your registration:
            </p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 25px 0;">
                <h3 style="margin: 0; color: #2d6a4f; font-size: 28px; letter-spacing: 3px;">${otp}</h3>
            </div>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
                This OTP is valid for <strong>10 minutes</strong>.<br>
                For security reasons, please do not share this code with anyone.
            </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #eaeaea; margin-top: 20px;">
            <p style="font-size: 12px; color: #666; margin: 5px 0;">
                Need help? Contact our support team at 
                <a href="mailto:support@agriconnect.com" style="color: #2d6a4f; text-decoration: none;">support@agriconnect.com</a>
            </p>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">
                © ${new Date().getFullYear()} AgriConnect. All rights reserved.
            </p>
        </div>
    </div>
    `
};

  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: "Failed to send OTP" });
    }
    res.json({ message: "OTP sent successfully" });
  });
});

// Verify OTP
app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    if (otpStorage[email] && otpStorage[email] == otp) {
        delete otpStorage[email]; // Remove OTP after verification
        return res.json({ message: "OTP verified successfully!" });
    } else {
        return res.status(400).json({ message: "Invalid OTP" });
    }
});

app.post('/send-contact-email', async (req, res) => {
  const { name, email, message } = req.body;
  
  try {
    const mailOptions = {
      from: '21jr1a4353@gmail.com',
      to: '21jr1a4353@gmail.com',
      subject: 'New Contact Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});



app.post("/create-account", async (req, res) => {
    const { username,email, mobile, password, account_type } = req.body;
    console.log("Create account request received:", { username, mobile, account_type });
    try {
        if (!username ||!email ||!mobile || !password || !account_type) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            contact_number:mobile,
            account_type,
            password: hashedPassword
        });

        await newUser.save();
        console.log("New user created:", {
            username: newUser.username,
            email:newUser.username,
            account_type: newUser.account_type,
            mobile: mobile,
            created_at: new Date()
        });
        res.json({ message: "Account created successfully!" ,user: {
          _id: newUser._id,
          username:newUser.username,
          email:newUser.email,
          contact_number: newUser.contact_number,
          account_type: newUser.account_type
        }});
    } catch (error) {
        console.error("Error creating account:", error);
        res.status(400).json({ message: "Username already exists or other error" });
    }
});


app.post("/login",async(req,res)=>{
  try{
    const {account_type,username,password}=req.body;
    const user=await User.findOne({username});
    if (!user) return res.status(400).json({message:"User not found"});

    const validPass= await bcrypt.compare(password,user.password)
    if (!validPass) return res.status(400).json({message:"Invalid Password"});

    const account= await User.findOne({account_type});
    if (!account) return res.status(400).json({message:`You don't have ${account_type} account`});

    res.json({message:"Login successfull",user: {
      _id: user._id,
      contact_number: user.contact_number,
      account_type: user.account_type,
      username: user.username
    }});
  }catch(error){
    res.status(500).json({message:error.message});
  }
});



// Add new profile schema
const profileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    first_name: String,
    last_name: String,
    email_id: String,
    
    state: String,
    district: String,
    city: String,
    address: String,
    alternate_contact_number: String,
    farmer_specific: {
      crop_types: [String],
      land_size: Number
    },
    dealer_specific: {
      license_number: String,
      business_address: String
    },
    storage_specific: {
      storage_capacity: Number,
      facility_type: String
    }
  });
  const Profile = mongoose.model("Profile", profileSchema);
  
  // Add new routes
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.params.userId })
        .populate('user', 'account_type')
        .lean()
        .exec();
      
      if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      
      // Get the specific data based on account type
      const accountType = profile.user.account_type;
      const specificData = profile[`${accountType}_specific`] || {};
      
      // Merge the data
      const mergedData = {
        ...profile,
        ...specificData
      };
      
      // Remove the nested specific data to avoid duplication
      delete mergedData.farmer_specific;
      delete mergedData.dealer_specific;
      delete mergedData.storage_specific;
      
      res.json(mergedData);
      
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/profile", async (req, res) => {
    try {
      const { userId, ...profileData } = req.body;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const existingProfile = await Profile.findOne({ user: userId });
      if(existingProfile) {
        return res.status(400).json({ message: "Profile already exists" });
      }
      
      const newProfile = new Profile({
        user: userId,
        ...profileData
      });
      
      const savedProfile = await newProfile.save();
      await User.findByIdAndUpdate(userId, { profile: savedProfile._id });
      res.status(201).json(savedProfile);
      
    } catch (error) {
      console.error("Error creating profile:", error);
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: "Profile already exists for this user"
        });
      }
      res.status(400).json({ message: error.message, details: error.errors });
    }
  });
  
  app.put("/api/profile/:id", async (req, res) => {
    try {
      const updatedProfile = await Profile.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json(updatedProfile);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

// Add after existing schemas
const userCropSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop_name: { type: String, required: true },
  crop_variety: { type: String, required: true },
  quantity: { type: Number, required: true },
  price_per_quintal: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['available', 'contracted'],
    default: 'available'
  }
});
const UserCrop = mongoose.model('UserCrop', userCropSchema);

// Add after UserCrop schema
const userNeedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop_needed: { type: String, required: true },
  variety: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  contact_number: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});
const UserNeed = mongoose.model('UserNeed', userNeedSchema);

const contractRequestSchema = new mongoose.Schema({
  contract_sent_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contract_sent_to_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  need: { type: mongoose.Schema.Types.ObjectId, ref: 'UserNeed' },
  crop: { type: mongoose.Schema.Types.ObjectId, ref: 'UserCrop'},
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

contractRequestSchema.pre('validate', function(next) {
  if (!this.crop && !this.need) {
    this.invalidate('crop', 'Either crop or need must be provided');
    this.invalidate('need', 'Either crop or need must be provided');
  }
  next();
});

const ContractRequest = mongoose.model('ContractRequest', contractRequestSchema);

const activeContractSchema = new mongoose.Schema({
  crop: { type: mongoose.Schema.Types.ObjectId, ref: 'UserCrop', required: true },
  contract_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ContractRequest', required: true },
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  producer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop_name: String,
  crop_variety: String,
  price_per_quintal: Number,
  quantity:Number,
  contract_date: { type: Date, default: Date.now },
  contract_type: { 
    type: String, 
    enum: ['dealer-need', 'standard'], 
    default: 'standard' 
  }
});
const ActiveContract = mongoose.model('ActiveContract', activeContractSchema);

const declinedContractSchema = new mongoose.Schema({
  original_request: { type: mongoose.Schema.Types.ObjectId, ref: 'ContractRequest' },
  declined_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String,
  declined_at: { type: Date, default: Date.now }
});
const DeclinedContract = mongoose.model('DeclinedContract', declinedContractSchema);

// Add Storage Booking Schema
const storageBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop: { type: mongoose.Schema.Types.ObjectId, ref: 'UserCrop', required: true },
  quantity: { type: Number, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  created_at: { type: Date, default: Date.now }
});
const StorageBooking = mongoose.model('StorageBooking', storageBookingSchema);

// Add to otpBackend.js after other schemas
const coldStorageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: {
    state: String,
    district: String,
    city: String,
    address:String
  },
  availability: { type: Boolean, default: true },
  price_per_quintal: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});
const ColdStorage = mongoose.model('ColdStorage', coldStorageSchema);

// Add after ColdStorage schema
const storageBookingRequestSchema = new mongoose.Schema({
  request_sent_user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  request_sent_username: String,
  request_sent_user_contact_no: String,
  request_sent_user_address: String,
  requested_storage_crop_quantity: Number,
  requested_storage_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ColdStorage', 
    required: true 
  },
  duration: Number,
  start_date: Date,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  created_at: { type: Date, default: Date.now }
});
const StorageBookingRequest = mongoose.model('StorageBookingRequest', storageBookingRequestSchema);

const activeStorageBookingSchema = new mongoose.Schema({
  crop_owner_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  crop_owner_name: String,
  crop_owner_contact_no: String,
  crop_owner_address: String,
  crop_quantity: Number,
  crop_storage_start_date: Date,
  crop_storage_end_date: Date,
  storage_period: Number,
  total_rent: Number,
  storage_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ColdStorage' ,
  },
  created_at: { type: Date, default: Date.now }
});
const ActiveStorageBooking = mongoose.model('ActiveStorageBooking', activeStorageBookingSchema);

// Get available storages with contact info
app.get('/api/available-storages', async (req, res) => {
  try {
    const storages = await ColdStorage.find({ availability: true })
      .populate({
        path: 'user',
        select: 'username',
        populate: {
          path: 'profile',
          select: 'contact_number address'
        }
      });

      const avgBookings = await StorageBooking.aggregate([
        { $group: { _id: null, avg: { $avg: "$quantity" } } }
      ]);
      
      const avg = avgBookings.length > 0 ? avgBookings[0].avg : 0;

    const enhancedStorages = storages.map(storage => ({
      ...storage.toObject(),
      contact_no: storage.user?.profile?.contact_number || 'NA',
      address: storage.user?.profile?.address || 'NA',
      booking_status: storage.quantity > avg ? 
        'Fast Filling' : storage.availability ? 'Available' : 'Full'
    }));

    res.json(enhancedStorages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle storage booking requests
app.post('/api/storage-requests', async (req, res) => {
  try {
    const { userId, storageId, quantity, duration, startDate } = req.body;
    if (!userId || !storageId || !quantity || !duration || !startDate) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findById(userId)
      .populate('profile');
    const storage = await ColdStorage.findById(storageId);

    const newRequest = new StorageBookingRequest({
      request_sent_user_id: userId,
      request_sent_username: user.username,
      request_sent_user_contact_no: user.profile?.contact_number,
      request_sent_user_address: user.profile?.address,
      requested_storage_crop_quantity: quantity,
      requested_storage_id: storageId,
      duration,
      start_date: startDate
    });

    await newRequest.save();
    console.log("Storage request saved:", newRequest);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get storage requests for owner
// otpBackend.js - Updated endpoint
app.get('/api/storage-requests/:userId', async (req, res) => {
  try {
    const userStorages = await ColdStorage.find({ user: req.params.userId });
    const storageIds = userStorages.map(storage => storage._id);
    const requests = await StorageBookingRequest.find({
      requested_storage_id: { $in: storageIds },
      status: 'pending'
    })
    .populate('requested_storage_id', 'name price_per_quintal');
    const formattedRequests = requests.map(request => ({
      _id: request._id,
      request_sent_username: request.request_sent_username,
      request_sent_user_contact_no: request.request_sent_user_contact_no,
      request_sent_user_address: request.request_sent_user_address,
      requested_storage_crop_quantity: request.requested_storage_crop_quantity,
      duration: request.duration,
      start_date: request.start_date,
      storage: {
        name: request.requested_storage_id?.name,
        price_per_quintal: request.requested_storage_id?.price_per_quintal
      }
    }));
    res.json(formattedRequests);
  } catch (error) {
    console.error("Storage requests error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to load storage requests",
      error: error.message 
    });
  }
});

app.put('/api/storage-requests/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await StorageBookingRequest.findById(req.params.id)
      .populate('requested_storage_id')
      .populate({
        path: 'request_sent_user_id',
        select: 'username profile',
        populate: {
          path: 'profile',
          select: 'contact_number address'
        }
      });

    if (status === 'accepted') {
      const activeBooking = new ActiveStorageBooking({
        crop_owner_id: request.request_sent_user_id,
        crop_owner_name: request.request_sent_username,
        crop_owner_contact_no: request.request_sent_user_id?.profile?.contact_number || request.request_sent_user_contact_no,
        crop_owner_address: request.request_sent_user_id?.profile?.address || request.request_sent_user_address,
        crop_quantity: request.requested_storage_crop_quantity,
        storage_period: request.duration,
        total_rent: (request.duration / 30) * request.requested_storage_id.price_per_quintal,
        storage_id: request.requested_storage_id._id,
        crop_storage_start_date: request.start_date,
        crop_storage_end_date: new Date(new Date(request.start_date).setDate(new Date(request.start_date).getDate() + request.duration))
      });

      await activeBooking.save();
    }

    await StorageBookingRequest.findByIdAndDelete(req.params.id);
    res.json({ message: `Request ${status} successfully` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Cold Storage Routes
app.get('/api/cold-storages/:userId', async (req, res) => {
  try {
    const storages = await ColdStorage.find({ user: req.params.userId });
    res.json(storages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/cold-storages', async (req, res) => {
  try {
    const { user, name, location, availability, price_per_quintal } = req.body;
    
    const newStorage = new ColdStorage({
      user,
      name,
      location,
      availability,
      price_per_quintal
    });

    const savedStorage = await newStorage.save();
    res.status(201).json(savedStorage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/cold-storages/:id', async (req, res) => {
  try {
    const updatedStorage = await ColdStorage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedStorage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Storage Booking Routes
app.post('/api/storage-bookings', async (req, res) => {
  try {
    const { user, crop, quantity, duration } = req.body;
    
    if (!user || !crop || !quantity || !duration) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newBooking = new StorageBooking({
      user: new mongoose.Types.ObjectId(user),
      crop: new mongoose.Types.ObjectId(crop),
      quantity,
      duration
    });

    const savedBooking = await newBooking.save()
      .populate('user', 'username')
      .populate('crop', 'crop_name crop_variety');

    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/storage-bookings/:userId', async (req, res) => {
  try {
    const bookings = await StorageBooking.find({ user: req.params.userId })
      .populate('user', 'username')
      .populate('crop', 'crop_name crop_variety');
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/storage-bookings/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedBooking = await StorageBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate('user', 'username')
    .populate('crop', 'crop_name crop_variety');

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/storage-requests/:id', async (req, res) => {
  try {
    const deletedRequest = await StorageBookingRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.json({ message: "Storage request deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/storage-bookings/:id', async (req, res) => {
  try {
    const deletedBooking = await StorageBooking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add after other storage routes
app.get('/api/active-storage-bookings/:userId', async (req, res) => {
  try {
    console.log(`Fetching active bookings for user: ${req.params.userId}`);
    const userStorages = await ColdStorage.find({ user: req.params.userId });
    const storageIds = userStorages.map(storage => storage._id);
    console.log(`User storage IDs: ${storageIds}`);
    const bookings = await ActiveStorageBooking.find({
      $or: [
        { storage_id: { $in: storageIds } },
        { crop_owner_id: req.params.userId }
      ]
    })
    .populate('storage_id', 'name location price_per_quintal')
    .populate({
      path: 'crop_owner_id',
      select: 'username profile',
      populate: {
        path: 'profile',
        select: 'contact_number address state district'
      }
    }).lean();
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      crop_owner_name: booking.crop_owner_id?.username || booking.crop_owner_name,
      crop_owner_contact_no: booking.crop_owner_id?.profile?.contact_number || booking.crop_owner_contact_no,
      crop_owner_address: booking.crop_owner_id?.profile?.address || booking.crop_owner_address,
      storage_id: booking.storage_id || { _id: booking.storage_id },
      crop_quantity: booking.crop_quantity,
      storage_period: booking.storage_period,
      total_rent: booking.total_rent,
      crop_storage_start_date: booking.crop_storage_start_date,
      crop_storage_end_date: booking.crop_storage_end_date
    }));

    
    res.json(formattedBookings);
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch active bookings",
      error: error.message 
    });
  }
});

// User Needs Routes
app.post('/api/user-needs', async (req, res) => {
  try {
    const { user, crop_needed, variety, quantity, price, contact_number } = req.body;
    
    const newNeed = new UserNeed({
      user: new mongoose.Types.ObjectId(user),
      crop_needed,
      variety,
      quantity,
      price,
      contact_number
    });

    const savedNeed = await newNeed.save();
    res.status(201).json(savedNeed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update the existing dealer-needs endpoint
app.get('/api/user-needs', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { user: new mongoose.Types.ObjectId(userId) } : {};
    
    const needs = await UserNeed.aggregate([
      {
        $match: {
          ...query,
          'user.account_type': 'dealer' // Only dealer needs
        }
      },
      {
        $lookup: {
          from: 'activecontracts',
          let: { needId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$contract_type', 'dealer-need'] },
                    { $eq: ['$contract_id.need', '$$needId'] }
                  ]
                }
              }
            }
          ],
          as: 'active_contracts'
        }
      },
      {
        $match: {
          active_contracts: { $size: 0 } // Exclude needs with active contracts
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'profiles',
          localField: 'user._id',
          foreignField: 'user',
          as: 'profile'
        }
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } }
    ]);
    res.json(needs);
  } catch (error) {
    console.error("Error fetching dealer needs:", error);
    res.status(500).json({ 
      message: "Failed to fetch dealer needs",
      error: error.message 
    });
  }
});

app.put('/api/user-needs/:id', async (req, res) => {
  try {
    const updatedNeed = await UserNeed.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedNeed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/user-needs/:id', async (req, res) => {
  try {
    await UserNeed.findByIdAndDelete(req.params.id);
    res.json({ message: "Need deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/user-crops/:userId?', async (req, res) => {
  try {
    
    if (req.params.userId && !mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const userId = req.params.userId;

    const matchQuery = userId ? { user: new mongoose.Types.ObjectId(userId) } : {};

    const aggregationPipeline =[
      {$match: {...matchQuery,status:'available'}},
      {
        $lookup: {
          from: 'activecontracts',
          let: { cropId: '$_id' },
          pipeline: [
            {
              $match: userId? {
                $expr: {
                  $or: [
                    { $eq: ['$dealer',new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$producer',new mongoose.Types.ObjectId(userId)] }
                  ]
                }
              }:{}
            },
            { $match: { $expr: { $eq: ['$crop', '$$cropId'] } } }
          ],
          as: 'active_contracts'
        }
      },
      // Filter out crops with active contracts
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'profiles',
          localField: 'user._id',
          foreignField: 'user',
          as: 'profile'
        }
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          crop_name: 1,
          crop_variety: 1,
          quantity: 1,
          price_per_quintal: 1,
          created_at: 1,
          'user._id': 1,
          'user.username': 1,
          'user.account_type': 1,
          'profile.first_name': 1,
          'profile.last_name': 1,
          'profile.state': 1,
          'profile.district': 1
        }
      }
    ];

    const crops = await UserCrop.aggregate(aggregationPipeline);
    res.json(Array.isArray(crops)? crops:[]);
  } catch (error) {
    console.error("Error fetching user crops:", error);
    res.status(500).json({ 
      message: "Failed to fetch crops",
      error: error.message 
    });
  }
});


app.post('/api/user-crops', async (req, res) => {
  try {
    // Enhanced validation
    const requiredFields = ['crop_name', 'quantity', 'price_per_quintal', 'user'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        fields: missingFields
      });
    }

    // Validate number formats
    if (isNaN(req.body.quantity)) {
      return res.status(400).json({ 
        message: "Quantity must be a number",
        field: 'quantity'
      });
    }
    console.log("Request body:", req.body);
    const newCrop = await UserCrop.create({
      ...req.body,
      user: new mongoose.Types.ObjectId(req.body.user) // Ensure proper ID format
    });
    console.log("New crop created:", newCrop);

    const savedCrop = await newCrop.save();
    const populated = await UserCrop.findById(savedCrop._id)
      .populate('user', 'username account_type');
      
    res.status(201).json(populated);

  } catch (error) {
    res.status(400).json({
      message: error.message,
      errors: error.errors
    });
  }
});

app.put('/api/user-crops/:id', async (req, res) => {
  try {
    const updatedCrop = await UserCrop.findByIdAndUpdate(new mongoose.Types.ObjectId(req.params.id), req.body, { new: true ,runValidators:true}).populate('user','username account_type');
    if (!updatedCrop) {
      return res.status(404).json({ message: "Crop not found" });
    }
    res.json(updatedCrop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add this route after existing user-crops routes
app.delete('/api/user-crops/:id', async (req, res) => {
  try {
    const deletedCrop = await UserCrop.findByIdAndDelete(req.params.id);
    if (!deletedCrop) {
      return res.status(404).json({ message: "Crop not found" });
    }
    res.json({ message: "Crop deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Contract Requests Routes
app.post('/api/contract-requests', async (req, res) => {
  try {
    const { need, ...rest } = req.body;
    const isValid = [
      rest.contract_sent_user,
      rest.contract_sent_to_user,
      need || rest.crop
    ].every(id => mongoose.Types.ObjectId.isValid(id));
    
    if (!isValid) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const newRequest = new ContractRequest({
      ...rest,
      ...(need ? { need } : { crop: rest.crop })
    });
    console.log("Incoming contract request data:", req.body);
    const savedRequest = await newRequest.save();
    const populatedRequest = await ContractRequest.findById(savedRequest._id)
    .populate(need ? 'need' : 'crop')
    .populate('contract_sent_user', 'username contact_number')
    .populate('contract_sent_to_user', 'username contact_number');
    console.log("Contract request saved:", savedRequest);
  res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/contract-requests/:userId', async (req, res) => {
  try {
    const requests = await ContractRequest.find({ 
      contract_sent_to_user: req.params.userId,
      _id: { $nin: (await DeclinedContract.find()).map(d => d.original_request) }
    })
    .populate({path: 'contract_sent_user',select: 'username contact_number',populate:{
      path:'profile',
      select:'district state'
    }})
    .populate({
      path: 'crop',
      select: 'crop_name crop_variety quantity price_per_quintal'
    })
    .populate({
      path: 'need',
      select: 'crop_needed variety quantity price'
    });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/contract-requests/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await ContractRequest.findById(req.params.id)
      .populate('contract_sent_user')
      .populate('crop')
      .populate('need');

    if (!request) return res.status(404).json({ message: "Request not found" });

    // Handle acceptance
    if (status === 'accepted') {
      if (request.crop) {
        await UserCrop.findByIdAndUpdate(request.crop._id, {
          $inc: { quantity: -request.crop.quantity }
        });
      }
      if (request.need) {
        await UserNeed.findByIdAndDelete(request.need._id);
      }
      const activeContract = new ActiveContract({
        contract_id: request._id,
        dealer: request.contract_sent_user._id,
        producer: request.contract_sent_to_user,
        crop:request.crop?._id,
        crop_name: request.crop?.crop_name || request.need?.crop_needed,
        crop_variety: request.crop?.crop_variety || request.need?.variety,
        price_per_quintal: request.crop?.price_per_quintal || request.need?.price,
        contract_type: request.need ? 'dealer-need' : 'standard',
        contract_date: new Date()
      });
      
      await activeContract.save();

      const populatedContract = await ActiveContract.findById(activeContract._id)
    .populate('dealer', 'username')
    .populate('producer', 'username')
    .populate('crop');

      await ContractRequest.findByIdAndDelete(req.params.id);
      
      return res.json({ 
        message: "Contract accepted successfully",
        activeContract :populatedContract
      });
    }

    // Handle decline
    if (status === 'declined') {
      const declinedContract = new DeclinedContract({
        original_request: request._id,
        declined_by: request.contract_sent_to_user,
        reason: req.body.reason || "No reason provided"
      });

      await declinedContract.save();
      await ContractRequest.findByIdAndDelete(req.params.id);
      
      return res.json({ 
        message: "Contract declined successfully",
        declinedContract 
      });
    }

    res.status(400).json({ message: "Invalid status update" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get('/api/dealer-needs', async (req, res) => {
  try {
    const needs = await UserNeed.find()
      .populate({
        path: 'user',
        match: { account_type: 'dealer' },
        select: 'username account_type contact_number profile',
        populate: {
          path: 'profile',
          select: 'first_name last_name state district' // Select specific profile fields
        }
      }).lean();

      const filteredNeeds = needs
      .filter(need => need.user && need.user.account_type === 'dealer')
      .map(need => ({
        ...need,
        crop_needed: need.crop_needed.trim().toLowerCase(),
        variety: need.variety.trim().toLowerCase()
      }));
    res.json(filteredNeeds);
  } catch (error) {
    console.error("Error fetching dealer needs:", error);
    res.status(500).json({ 
      message: "Failed to fetch dealer needs",
      error: error.message 
    });
  }
});

// In your backend's check-request endpoint (otpBackend.js)
app.get('/api/check-request', async (req, res) => {
  try {
    const { sentBy, sentTo, cropId, needId } = req.query;

    // Validate all IDs format
    const validateMongoId = (id) => mongoose.Types.ObjectId.isValid(id);
    if (!validateMongoId(sentBy) || !validateMongoId(sentTo)) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    // Prevent self-requests
    if (sentBy === sentTo) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    // Validate either cropId or needId
    const query = { 
      contract_sent_user: sentBy,
      contract_sent_to_user: sentTo,
      $or: []
    };

    if (cropId) {
      if (!validateMongoId(cropId)) return res.status(400).json({ message: "Invalid crop ID" });
      query.$or.push({ crop: cropId });
    }
    
    if (needId) {
      if (!validateMongoId(needId)) return res.status(400).json({ message: "Invalid need ID" });
      query.$or.push({ need: needId });
    }

    if (!query.$or.length) {
      return res.status(400).json({ message: "Must provide cropId or needId" });
    }

    const existingRequest = await ContractRequest.findOne(query);
    res.json({ exists: !!existingRequest });

  } catch (error) {
    console.error("Check request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add similar routes for Active Contracts
app.post('/api/active-contracts', async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['crop',
      'contract_id', 'dealer', 'producer', 
      'crop_name', 'price_per_quintal'
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    const contractRequest = await ContractRequest.findById(req.body.contract_id)
      .populate('crop');

    // Create new contract
    const newContract = new ActiveContract({
      ...req.body,
      crop: contractRequest.crop._id, // Add crop reference
      crop_name: contractRequest.crop.crop_name,
      crop_variety: contractRequest.crop.crop_variety
    });
    const savedContract = await newContract.save();
    
    // Populate user details
    const populated = await ActiveContract.findById(savedContract._id)
      .populate('dealer', 'username')
      .populate('producer', 'username')
      .populate('crop','quantity');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ 
      message: error.message,
      errors: error.errors 
    });
  }
});

app.get('/api/active-contracts/:userId', async (req, res) => {
  try {
    const contracts = await ActiveContract.find({
      $or: [
        { producer: req.params.userId },
        { dealer: req.params.userId }
      ]
    })
    .populate('dealer', 'username contact_number')
    .populate('producer', 'username contact_number')
    .populate({
      path: 'contract_id',
      populate: {
        path: 'crop',
        select: 'quantity'
      }
    });

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
    console.log(`OTP Backend running on http://localhost:${PORT}`);
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});