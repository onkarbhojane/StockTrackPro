import nodemailer from "nodemailer";
// Transporter setup with Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Use environment variables
        pass: process.env.EMAIL_PASS,
    },
});
console.log(process.env.EMAIL_USER,process.env.EMAIL_PASS);
console.log("ansnlcjknlkdsjnclkj");

const sendMail=async (req, res) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "onkarbhojane2002@gmail.com",
        subject: "Sending Email using Node.js",
        text: "That was easy!",
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        res.status(200).send(`Email sent successfully! Message ID: ${info.messageId}`);
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send("Failed to send email. Please try again later.");
    }
}

export default sendMail;