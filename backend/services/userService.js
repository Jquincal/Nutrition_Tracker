export async function getUserId(client, clerkUserId) {
  const result = await client.query('SELECT id FROM users WHERE clerk_user_id=$1', [clerkUserId]);
  if (!result.rows[0]) {
    const error = new Error('User profile not found');
    error.status = 404;
    throw error;
  }
  return result.rows[0].id;
}
