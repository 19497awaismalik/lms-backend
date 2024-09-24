import nodemail from 'nodemailer';
import path from 'path'
import { config } from 'dotenv';
import ejs from 'ejs'
// import fs from 'fs/promises';
config()

const sendMail=async(options)=>{
    const transporter= nodemail.createTransport({
        host:process.env.SMTP_HOST,
        port:process.env.SMTP_PORT,
        service:process.env.SMTP_SERVICE,
        secure:true,
        auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASSWORD
        }
    })
       
    const {email,subject,template,data}=options;

    // ENOENT: no such file or directory, open 'mails/activation-mail.ejs
      const templatePath= path.join("mails",template);

    let html=await ejs.renderFile(templatePath,data);
   const mailOptions={
    from:process.env.SMTP_MAIL,
    to:email,
    subject,
    html
}
 
 return  await transporter.sendMail(mailOptions);


}

export default sendMail;

