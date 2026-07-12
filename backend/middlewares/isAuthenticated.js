import jwt from "jsonwebtoken";
const isAuthenticated = async (req,res,next)=>{
    try {
        console.log('\n=== isAuthenticated middleware ===');
        console.log('METHOD:', req.method);
        console.log('URL:', req.originalUrl);
        console.log('Body:', req.body);
        console.log('All Cookies:', req.cookies);
        console.log('Authorization Header:', req.headers.authorization);
        
        // Check for token in cookies first, then in Authorization header
        let token = req.cookies.token;
        
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
            }
        }
        
        if(!token){
            console.log('❌ NO TOKEN FOUND');
            console.log('   Cookies available:', Object.keys(req.cookies));
            console.log('   Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
            return res.status(401).json({
                message:'User not authenticated',
                success:false
            });
        }
        console.log('✅ TOKEN FOUND:', token.substring(0, 30) + '...');
        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        if(!decode){
            return res.status(401).json({
                message:'Invalid token',
                success:false
            });
        }
        req.id = decode.userId;
        next();
    } catch (error) {
        console.error('Authentication Error:', error.message);
        return res.status(401).json({
            message: 'Token verification failed',
            success: false,
            error: error.message
        });
    }
}
export default isAuthenticated;