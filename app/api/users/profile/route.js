import { createAdminClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { user_id, name, email } = await request.json();

    if (!user_id || typeof user_id !== 'string') {
      return Response.json({ error: 'Invalid user_id' }, { status: 400 });
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const sanitizedName = name.trim().slice(0, 100).replace(/[<>]/g, '');

    // Use admin client — bypasses RLS to create profile after email signup
    // (user may not have confirmed email yet, so anon client would fail RLS)
    const supabaseAdmin = createAdminClient();

    // Verify the user_id belongs to a real auth user before creating profile
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user_id);
    if (authError || !authUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id,
        name: sanitizedName,
        email: email.trim().toLowerCase().slice(0, 254),
      }, { onConflict: 'user_id' });

    if (error) throw error;

    return Response.json({ success: true });
  } catch (err) {
    console.error('Profile creation error:', err.message);
    return Response.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}
