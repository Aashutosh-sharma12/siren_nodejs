"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmailIdentity = exports.verifyEmail = exports.SendRawEmail_withTemplate = exports.sendEmail = void 0;
const aws_config_1 = require("./aws_config");
const client_ses_1 = require("@aws-sdk/client-ses");
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const path_1 = __importDefault(require("path"));
const mime_types_1 = __importDefault(require("mime-types"));
const facebook_link = process.env.FACEBOOK_LINK;
const linkedin_link = process.env.LINKEDIN_LINK;
const instagram_link = process.env.INSTAGRAM_LINK;
const messanger_link = process.env.MESSANGER_LINK;
const web_Url = process.env.WEB_URL;
const loadTemplate = (templateName, context) => {
    const filePath = path_1.default.join(__dirname, '..', 'public/emailTemplates', `${templateName}.html`);
    const source = fs_1.default.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars_1.default.compile(source);
    return template(context);
};
const sendEmail = async (data) => {
    const { toAddress, subject, templateName, context } = data;
    context.baseUrl = process.env.BaseUrl + "emailTemplates/img/";
    console.log(context);
    const htmlBody = loadTemplate(templateName, context);
    const params = {
        Destination: {
            ToAddresses: [toAddress],
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: htmlBody,
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject,
            },
        },
        Source: process.env.SES_VERIFIED_EMAIL, // Must be a verified email in SES
    };
    try {
        const sesClient = await (0, aws_config_1.getSESClient)();
        const data = await sesClient.send(new client_ses_1.SendEmailCommand(params));
        console.log('Email sent successfully:', data);
    }
    catch (err) {
        console.error('Error sending email:', err);
    }
};
exports.sendEmail = sendEmail;
const SendRawEmail_withTemplate = async (data) => {
    const { toAddress, subject, templateName, context } = data;
    context.linkedin_link = linkedin_link;
    context.instagram_link = instagram_link;
    context.messanger_link = messanger_link;
    context.facebook_link = facebook_link;
    context.year = new Date().getFullYear();
    context.webSite_Url = web_Url;
    const htmlBody = loadTemplate(templateName, context); // your HTML template with inline images
    const fromAddress = process.env.SES_VERIFIED_EMAIL;
    let imagePaths = [
        'fb_logo.png', 'instagram_logo.png', 'linkedin_logo.png', "vi-logo-white.png", 'messanger_logo.png'
    ];
    let images = [];
    if (templateName == 'confirmation_email') {
        images = ['emailconfirmation.png'];
    }
    if (templateName == 'welcome_email') {
        images = ['righttick.png',];
    }
    if (templateName == 'forgot_password') {
        images = ['reset.png'];
    }
    imagePaths = [...imagePaths, ...images];
    const attachments = imagePaths.map((imagePath) => {
        const filePath = path_1.default.join(__dirname, '..', 'public', 'emailTemplates', 'img', imagePath);
        const content = fs_1.default.readFileSync(filePath);
        const mimeType = mime_types_1.default.lookup(imagePath) || 'application/octet-stream';
        return {
            content,
            filename: imagePath,
            mimeType,
            cid: imagePath, // reference this in your HTML as <img src="cid:logo.svg" />
        };
    });
    // Construct MIME message
    const boundary = `NextPart_${Date.now()}`;
    const rawMessage = [];
    rawMessage.push(`From: ${fromAddress}`);
    rawMessage.push(`To: ${toAddress}`);
    rawMessage.push(`Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`);
    rawMessage.push('MIME-Version: 1.0');
    rawMessage.push(`Content-Type: multipart/related; boundary="${boundary}"\n`);
    rawMessage.push(`--${boundary}`);
    rawMessage.push('Content-Type: text/html; charset=UTF-8');
    rawMessage.push('Content-Transfer-Encoding: 7bit\n');
    rawMessage.push(htmlBody);
    for (const attachment of attachments) {
        rawMessage.push(`--${boundary}`);
        rawMessage.push(`Content-Type: ${attachment.mimeType}`);
        rawMessage.push('Content-Transfer-Encoding: base64');
        rawMessage.push(`Content-ID: <${attachment.cid}>`);
        rawMessage.push(`Content-Disposition: inline; filename="${attachment.filename}"\n`);
        rawMessage.push(attachment.content.toString('base64'));
    }
    rawMessage.push(`--${boundary}--`);
    const params = {
        RawMessage: {
            Data: Buffer.from(rawMessage.join('\r\n')),
        },
    };
    try {
        const sesClient = await (0, aws_config_1.getSESClient)();
        const response = await sesClient.send(new client_ses_1.SendRawEmailCommand(params));
        console.log('Email sent:', response);
    }
    catch (err) {
        console.error('Error sending email:', err);
    }
};
exports.SendRawEmail_withTemplate = SendRawEmail_withTemplate;
// sendEmail(data);
// SendRawEmail_withTemplate(data);
/**
 *
 * @param emailAddress - The email address to verify for sandbox mode
 * @returns
 */
const verifyEmail = async (emailAddress) => {
    try {
        const command = new client_ses_1.VerifyEmailIdentityCommand({
            EmailAddress: emailAddress,
        });
        const sesClient = await (0, aws_config_1.getSESClient)();
        const response = await sesClient.send(command);
        console.log("Verification email sent to:", emailAddress);
        return response;
    }
    catch (err) {
        console.error("Error verifying email:", err);
    }
};
exports.verifyEmail = verifyEmail;
const deleteEmailIdentity = async (email) => {
    try {
        const command = new client_ses_1.DeleteIdentityCommand({
            Identity: email,
        });
        const sesClient = await (0, aws_config_1.getSESClient)();
        const response = await sesClient.send(command);
        console.log(`Email identity "${email}" has been removed.`);
        return response;
    }
    catch (err) {
        console.error("Error deleting identity:", err);
    }
};
exports.deleteEmailIdentity = deleteEmailIdentity;
