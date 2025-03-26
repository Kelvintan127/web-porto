import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
      port: process.env.SMTP_PORT,
      secure: true, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const mailOptions = {
      from: 'kelvin@klveen.com',
      to: 'kelvin@klveen.com',
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
      html: `
<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
  <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Contact Form Message</h2>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 10px 0;"><strong style="color: #1e40af;">Name:</strong> ${name}</p>
    <p style="margin: 10px 0;"><strong style="color: #1e40af;">Email:</strong> ${email}</p>
    <p style="margin: 10px 0;"><strong style="color: #1e40af;">Subject:</strong> ${subject}</p>
    
    <div style="margin-top: 20px;">
      <strong style="color: #1e40af;">Message:</strong>
      <p style="white-space: pre-wrap; margin-top: 10px; line-height: 1.5;">${message}</p>
    </div>
  </div>
  
  <div style="font-size: 12px; color: #666; margin-top: 20px; text-align: center;">
    This message was sent from your portfolio contact form
  </div>
</div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 }
    );
  }
}