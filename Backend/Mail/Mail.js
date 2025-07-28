import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "onkar.bhojane22@gmail.com",
    pass: process.env.PASS,
  },
});


export default transporter;

// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.error("Error sending email: ", error);
//   } else {
//     console.log("Email sent: ", info.response);
//   }
// });
