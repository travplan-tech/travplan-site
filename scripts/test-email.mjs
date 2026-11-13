/**
 * Sends one test email through the same transport lib/email.ts uses, to prove
 * the Gmail credentials still work and that mail actually arrives.
 *
 *   node --env-file=.env.local scripts/test-email.mjs <recipient>
 *
 * It verifies the connection before sending, so a bad password reports itself
 * as an auth failure rather than as a silent non-delivery.
 */
import nodemailer from "nodemailer"

const to = process.argv[2]
if (!to || !to.includes("@")) {
    console.error("Usage: node --env-file=.env.local scripts/test-email.mjs <recipient>")
    process.exit(1)
}

const user = process.env.EMAIL_ID
const pass = process.env.EMAIL_PASS
if (!user || !pass) {
    console.error("EMAIL_ID or EMAIL_PASS is not set in .env.local")
    process.exit(1)
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
})

console.log(`sending as ${user}`)
console.log(`        to ${to}`)

try {
    await transporter.verify()
    console.log("  transport: credentials accepted by Gmail")
} catch (e) {
    console.error(`  transport FAILED: ${e.message}`)
    process.exit(1)
}

const sentAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

const info = await transporter.sendMail({
    from: `"Travplan Enquiry" <${user}>`,
    to,
    subject: `✅ Travplan mail test — ${sentAt}`,
    html: `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <div style="background:#e05323;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
        <h1 style="margin:0;font-size:20px">Travplan mail test</h1>
      </div>
      <div style="border:1px solid #eee;border-top:0;border-radius:0 0 12px 12px;padding:24px">
        <p style="margin:0 0 14px">If you are reading this, enquiry notifications can reach this inbox.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#666">Sent from</td><td style="padding:6px 0"><b>${user}</b></td></tr>
          <tr><td style="padding:6px 0;color:#666">Sent to</td><td style="padding:6px 0"><b>${to}</b></td></tr>
          <tr><td style="padding:6px 0;color:#666">Sent at</td><td style="padding:6px 0"><b>${sentAt} IST</b></td></tr>
        </table>
        <p style="margin:18px 0 0;font-size:13px;color:#666">
          This is a test message, not a real enquiry. Set ADMIN_EMAIL to this
          address so live enquiry notifications arrive here too.
        </p>
      </div>
    </div>`,
    text: `Travplan mail test.\n\nIf you are reading this, enquiry notifications can reach this inbox.\nFrom: ${user}\nTo: ${to}\nAt: ${sentAt} IST\n\nThis is a test message, not a real enquiry.`,
})

console.log(`  accepted: ${info.accepted.join(", ") || "(none)"}`)
if (info.rejected?.length) console.log(`  rejected: ${info.rejected.join(", ")}`)
console.log(`  messageId: ${info.messageId}`)
console.log(`  server: ${info.response}`)
