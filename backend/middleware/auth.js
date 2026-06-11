import { getAuth } from '@clerk/express';

export function protect(req, res, next) {
  const devUserId = process.env.NODE_ENV !== 'production' && process.env.DEV_USER_ID;
  if (devUserId && !process.env.CLERK_SECRET_KEY) {
    req.userId = devUserId;
    return next();
  }
  const auth = getAuth(req);
  const userId = auth?.userId || devUserId;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  req.userId = userId;
  next();
}
