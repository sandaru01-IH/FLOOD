// Simple admin authentication using password and sessions

import { createServerClient } from './supabase';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Should be set in environment

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === ADMIN_PASSWORD;
}

export async function createAdminSession(): Promise<string> {
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

  const supabase = createServerClient();
  await supabase.from('admin_sessions').insert({
    session_token: sessionToken,
    expires_at: expiresAt.toISOString(),
  });

  return sessionToken;
}

export async function verifyAdminSession(sessionToken: string | null): Promise<boolean> {
  if (!sessionToken) return false;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('admin_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return false;

  return true;
}

