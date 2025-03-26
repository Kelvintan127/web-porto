import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message, phone } = await req.json();

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': process.env.FONNTE_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: process.env.WHATSAPP_NUMBER,
        message: message,
      }),
    });

    const data = await response.json();

    if (data.status === true) {
      return NextResponse.json({ message: "WhatsApp message sent successfully" }, { status: 200 });
    } else {
      throw new Error(data.message || "Failed to send WhatsApp message");
    }
  } catch (error) {
    console.error('Fonnte error:', error);
    return NextResponse.json({ message: "Failed to send WhatsApp message" }, { status: 500 });
  }
}