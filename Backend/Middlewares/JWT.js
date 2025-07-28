import jwt from 'jsonwebtoken';

const jwtAuthMiddleware = (req, res, next) => {
    try {
        console.log("JWT Auth Middleware Triggered");

        const authHeader = req.headers.authorization
        console.log(authHeader)
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header is missing' });
        }
        
        const token1 = authHeader.split(' ')[1]
        let token=""
        for(let i=0;i<token1.length;i++){
            if(token.charAt(i)!=';') token+=token1.charAt(i);
        }
        if (!token) {
            console.log("Token is missing in Authorization header",token);
            return res.status(401).json({ error: 'Token is missing in Authorization header' });
        }

        console.log(token)
        const decoded = jwt.verify(token, "1234");
        req.userPayload = decoded;
        console.log(decoded)

        next();
    } catch (error) {
        console.error("JWT Verification Failed:", error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const generateToken = (userData) => {
    try {
        return jwt.sign(userData, '1234', { algorithm: 'HS256' });
    } catch (error) {
        console.error('Error generating token:', error.message);
        throw error;
    }
};

export { jwtAuthMiddleware, generateToken };
