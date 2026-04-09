import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // a very basic placeholder authentication; replace with real logic
  if (username === 'admin' && password === 'password') {
    return NextResponse.json({ message: 'Logged in' });
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
