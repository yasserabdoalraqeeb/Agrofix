<?php

/**
 * Agrofix United Contact Handler
 * Security-focused contact endpoint with PHPMailer SMTP + auto-responder email.
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!is_file($autoloadPath)) {
  error_log('PHPMailer autoload not found. Run Composer install.');
  header('Location: index.html?status=error', true, 303);
  exit;
}
require_once $autoloadPath;

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

// البريد الذي يستقبل رسائل النموذج (إيميل الإدارة)
$siteEmail = 'Info@agrofixunited.com';
$recipient = $siteEmail;
// ملاحظة: داخل الإيميل يفضّل رابط شعار عام https وليس مسار محلي
// مثال صحيح: https://your-domain.com/assets/images/logo.png
$companyLogo = 'assets/images/شعار اجروفيكس .png';
$socialFacebook = 'https://facebook.com';
$socialLinkedIn = 'https://linkedin.com';
$socialInstagram = 'https://instagram.com';

/**
 * SMTP (Gmail) settings
 *
 * ضع البريد وكلمة مرور التطبيق هنا، أو الأفضل عبر متغيرات البيئة:
 * - AGROFIX_SMTP_USERNAME
 * - AGROFIX_SMTP_APP_PASSWORD
 *
 * ملاحظة: كلمة المرور يجب أن تكون App Password من 16 حرفًا (بدون المسافات).
 */
$smtpHost = 'smtp.gmail.com';
$smtpPort = 587;
$smtpEncryption = PHPMailer::ENCRYPTION_STARTTLS;
// ضع هنا بريد Gmail الذي سيُستخدم للإرسال عبر SMTP
// مثال: info@yourdomain.com أو youraccount@gmail.com
$smtpUsername = getenv('AGROFIX_SMTP_USERNAME') ?: 'Info@agrofixunited.com';
// ضع هنا App Password من 16 حرف (من Google) بدون مسافات
// لا تضع كلمة مرور Gmail العادية
$smtpAppPassword = getenv('AGROFIX_SMTP_APP_PASSWORD') ?: 'YOUR_16_CHAR_APP_PASSWORD';

$smtpPlaceholdersUsed = str_contains($smtpUsername, 'YOUR_') || str_contains($smtpAppPassword, 'YOUR_');
if ($smtpPlaceholdersUsed) {
  error_log('SMTP credentials are placeholders. Set AGROFIX_SMTP_USERNAME and AGROFIX_SMTP_APP_PASSWORD.');
  header('Location: index.html?status=error', true, 303);
  exit;
}

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

/**
 * Configure PHPMailer with shared SMTP settings.
 */
$configureMailer = static function (PHPMailer $mailer) use ($smtpHost, $smtpPort, $smtpEncryption, $smtpUsername, $smtpAppPassword): void {
  $mailer->isSMTP();
  $mailer->Host = $smtpHost;
  $mailer->Port = $smtpPort;
  $mailer->SMTPAuth = true;
  $mailer->Username = $smtpUsername;
  $mailer->Password = $smtpAppPassword;
  $mailer->SMTPSecure = $smtpEncryption;
  $mailer->CharSet = 'UTF-8';
  $mailer->isHTML(true);
};

try {
  // 1) Admin email
  $adminMailer = new PHPMailer(true);
  $configureMailer($adminMailer);
  $adminMailer->setFrom($smtpUsername, 'Agrofix United');
  $adminMailer->addAddress($recipient, 'Agrofix Admin');
  $adminMailer->addReplyTo($safeReplyEmail, $safeName);
  $adminMailer->Subject = $subjectAdmin;
  $adminMailer->Body = $adminBody;
  $adminMailer->AltBody = "New Contact Request - Agrofix United\n"
    . "Name: {$name}\n"
    . "Email: {$email}\n"
    . "Phone: {$phone}\n\n"
    . "Message:\n{$message}";
  $adminMailer->send();

  // 2) Auto-responder email to customer
  $userMailer = new PHPMailer(true);
  $configureMailer($userMailer);
  $userMailer->setFrom($smtpUsername, 'Agrofix United');
  $userMailer->addAddress($email, $safeName);
  $userMailer->addReplyTo($siteEmail, 'Agrofix United');
  $userMailer->Subject = $subjectUser;
  $userMailer->Body = $userBody;
  $userMailer->AltBody = "Dear {$name},\n\n"
    . "Thank you for contacting Agrofix United for Agricultural Fertilizers. "
    . "We received your message and will get back to you shortly.\n\n"
    . "For urgent follow-up: {$siteEmail}\n\n"
    . "Best regards,\nAgrofix United Team";
  $userMailer->send();

  header('Location: index.html?status=sent', true, 303);
  exit;
} catch (Exception $e) {
  error_log('PHPMailer error: ' . $e->getMessage());
  header('Location: index.html?status=error', true, 303);
  exit;
}
