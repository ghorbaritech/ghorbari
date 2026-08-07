import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        console.warn('SMTP credentials are not configured in .env.local. Simulating email send to:', to);
        console.log('Subject:', subject);
        console.log('Body:', html);
        return { success: true, simulated: true };
    }

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
        });

        await transporter.sendMail({
            from: `"Dalan Kotha" <${user}>`,
            to,
            subject,
            html
        });

        return { success: true };
    } catch (error: any) {
        console.error('Failed to send email:', error);
        return { error: error.message || 'Failed to send email' };
    }
}
