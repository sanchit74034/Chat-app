import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import generatetoken from '../lib/utils.js'
import cloudinary from '../lib/cloudinary.js'



export const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword
    });

    
    await newUser.save();

    
    generatetoken(newUser._id, res);  

    
    res.status(201).json({
      _id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      profilepic: newUser.profilepic
    });

  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const login = async (req,res)=>{

    const {email,password} = req.body;
        try {
            const user = await User.findOne({email})
            if(!user){
                res.status(400).json({message: "Invalid ceredentials"})
            }

            const isPasswordCorrect = await bcrypt.compare(password,user.password);
            if(!isPasswordCorrect){
                res.status(400).json({message:"Invalid ceredentials"})
            }

            generatetoken(user._id, res);

            res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilepic: user.profilepic,
    });

         } 
         catch (error) {
            console.log("error in login page",error.message);
            res.status(500).json({message:"Internal error"})
        }
}


export const logout = (req,res)=>{
    try {
      res.cookie("jwt","",{
        maxAge:0,
        httpOnly: true,
        sameSite: 'Strict',
        secure: process.env.NODE_ENV !== 'development'
    })
      res.status(200).json({message:"logout succesfully"})  
    } catch (error) {
        console.log("error in logout controller",error.message);
        res.status(500).json({message:"Internal server erro"})
    }
}

export const changepassword = async (req,res) =>{
    try {

        const userId = req.user.userId;
        const{email,oldPassword,newPassword} = req.body;

        if(!email || !oldPassword || !newPassword){
            res.status(400).json({message:"All fields are required"});
        }

        const user = await User.findById(userId);
        if(!user){
            res.send(400).json({message:"User Not Found"})
        }

       const IsPasswordMatch = await bcrypt.compare(oldPassword,user.password)
       if(!IsPasswordMatch){
        res.status(400).json({message:"Password is incorrect"})
       }

       if(newPassword.length<6){
        res.status(400).json({message:"Password contain atLeast 6 characters"})
       }
       const salt = await bcrypt.genSalt(10);
       user.password = await bcrypt.hash(newPassword,salt)
       await user.save();

       res.status(201).json({message:"Password change Successfully"})

    } catch (error) {
        res.status(500).json({message:"Internal server error"})
    }
}

export const updateProfilePic = async (req, res) => {
  try {
    const userId = req.user._id;  // from protectedRoute

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    // Upload to Cloudinary
    const uploadToCloudinary = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile_pics" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(buffer);
      });

    const result = await uploadToCloudinary(req.file.buffer);

    const user = await User.findByIdAndUpdate(
      userId,
      { profilepic: result.secure_url },
      { new: true }
    );

    res.status(200).json({ profilepic: user.profilepic });
  } catch (error) {
    console.error("Profile pic update error:", error);
    res.status(500).json({ message: "Error updating profile picture" });
  }
};

export const checkauth = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: "Unauthorized access" });
  }
};

 
