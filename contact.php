<?php

/**
 * Agrofix United Contact Handler
 * Security-focused contact endpoint with auto-responder email.
 */

declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: index.html', true, 303);
  exit;
}

// Basic anti-bot honeypot check.
if (!empty($_POST['company'] ?? '')) {
  header('Location: index.html?status=sent', true, 303);
  exit;
}

// Sanitize and validate input.
$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$phone = trim((string)($_POST['phone'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

$validName = (strlen($name) >= 2 && strlen($name) <= 100);
$validEmail = filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
$validPhone = preg_match('/^[+0-9\s()\-]{7,20}$/', $phone) === 1;
$validMessage = (strlen($message) >= 10 && strlen($message) <= 1500);

if (!$validName || !$validEmail || !$validPhone || !$validMessage) {
  header('Location: index.html?status=error', true, 303);
  exit;
}

// Prevent email header injection.
$blockedPatterns = '/(content-type:|bcc:|cc:|to:|mime-version:|multipart\/mixed)/i';
if (preg_match($blockedPatterns, $name) || preg_match($blockedPatterns, $email)) {
  header('Location: index.html?status=error', true, 303);
  exit;
}

$safeReplyEmail = str_replace(["\r", "\n"], '', $email);

$siteEmail = 'Info@agrofixunited.com';
$recipient = $siteEmail;
$companyLogo = 'https://dummyimage.com/260x70/ffffff/1f5e24&text=Agrofix+United';
$socialFacebook = 'https://facebook.com';
$socialLinkedIn = 'https://linkedin.com';
$socialInstagram = 'https://instagram.com';

// Main contact email to Agrofix team.
$subjectAdmin = 'New Contact Request - Agrofix United';
$safeName = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safePhone = htmlspecialchars($phone, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));

$adminBody = "
<html>
<head><meta charset='UTF-8'><title>New Contact Request</title></head>
<body style='font-family:Arial,sans-serif;background:#f5f7f4;padding:20px;color:#1e2a1f;'>
  <div style='max-width:700px;margin:0 auto;background:#ffffff;border-radius:10px;padding:24px;border:1px solid #dde7da;'>
    <h2 style='margin-top:0;color:#1f5e24;'>Agrofix United - New Inquiry</h2>
    <p><strong>Name:</strong> {$safeName}</p>
    <p><strong>Email:</strong> {$safeEmail}</p>
    <p><strong>Phone:</strong> {$safePhone}</p>
    <hr style='border:none;border-top:1px solid #e1eadf;margin:18px 0;'>
    <p><strong>Message:</strong></p>
    <p>{$safeMessage}</p>
  </div>
</body>
</html>
";

$adminHeaders = [
  'MIME-Version: 1.0',
  'Content-type: text/html; charset=UTF-8',
  'From: Agrofix United <' . $siteEmail . '>',
  'Reply-To: ' . $safeReplyEmail,
  'X-Mailer: PHP/' . phpversion(),
];

$adminSent = @mail($recipient, $subjectAdmin, $adminBody, implode("\r\n", $adminHeaders));

// Auto-responder to user.
$subjectUser = 'Thank you for contacting Agrofix United';
$userBody = "
<html>
<head><meta charset='UTF-8'><title>Thank You - Agrofix United</title></head>
<body style='margin:0;padding:0;background:#edf3ea;font-family:Arial,sans-serif;color:#1f2d22;'>
  <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='padding:24px;'>
    <tr>
      <td align='center'>
        <table role='presentation' width='620' cellpadding='0' cellspacing='0' style='max-width:620px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dce8d9;'>
          <tr>
            <td style='background:linear-gradient(135deg,#2f7d32,#1f5e24);padding:24px;color:#ffffff;text-align:center;'>
              <img src='{$companyLogo}' alt='Agrofix United Logo' style='max-width:220px;width:100%;height:auto;display:block;margin:0 auto 12px;'>
              <div style='font-size:13px;letter-spacing:1px;text-transform:uppercase;'>Agrofix United</div>
              <h1 style='margin:10px 0 0;font-size:26px;'>Thank You for Reaching Out</h1>
            </td>
          </tr>
          <tr>
            <td style='padding:28px;'>
              <p style='margin-top:0;'>Dear {$safeName},</p>
              <p>Thank you for contacting <strong>Agrofix United for Agricultural Fertilizers</strong>. We have received your message and our team will get back to you shortly.</p>
              <p>For any urgent follow-up, please contact us at <a href='mailto:{$siteEmail}' style='color:#2f7d32;text-decoration:none;'>{$siteEmail}</a>.</p>
              <p>We appreciate your trust in our sustainable and high-performance agricultural solutions.</p>
              <p style='margin-bottom:22px;'>Best regards,<br><strong>Agrofix United Team</strong></p>

              <table role='presentation' cellpadding='0' cellspacing='0' style='margin-top:8px;'>
                <tr>
                  <td style='padding-right:10px;'><a href='{$socialFacebook}' style='color:#2f7d32;text-decoration:none;'>Facebook</a></td>
                  <td style='padding-right:10px;'><a href='{$socialLinkedIn}' style='color:#2f7d32;text-decoration:none;'>LinkedIn</a></td>
                  <td><a href='{$socialInstagram}' style='color:#2f7d32;text-decoration:none;'>Instagram</a></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
";

$userHeaders = [
  'MIME-Version: 1.0',
  'Content-type: text/html; charset=UTF-8',
  'From: Agrofix United <' . $siteEmail . '>',
  'Reply-To: ' . $siteEmail,
  'X-Mailer: PHP/' . phpversion(),
];

$userSent = @mail($email, $subjectUser, $userBody, implode("\r\n", $userHeaders));

if ($adminSent && $userSent) {
  header('Location: index.html?status=sent', true, 303);
  exit;
}

header('Location: index.html?status=error', true, 303);
exit;
