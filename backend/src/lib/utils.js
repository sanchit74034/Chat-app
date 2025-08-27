import jwt from 'jsonwebtoken';

const generatetoken = ((userId,res)=>{

    const token = jwt.sign({userId},process.env.JWT_KEY,
        {expiresIn:"7d"}
    )

    res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000,
        secure:process.env.NODE_ENV!=='development',
        sameSite:'Strict',
        httpOnly:true,
    })

return token;
})
export default generatetoken;
