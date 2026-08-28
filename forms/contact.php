<?php
/**
 * Contact Form Handler (Recommended - Using PHPMailer with SMTP)
 */

// --- Dependencies ---
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Ensure Composer's autoloader is included
// Adjust the path if contact.php is not directly in the project root
require '../vendor/autoload.php'; // Assumes vendor is one level up from 'forms'

// --- CONFIGURATION ---
// ********************************************************************
// ****** CONFIGURE YOUR EMAIL AND SMTP SETTINGS HERE *****************
$receiving_email_address = 'devalpiprotar1@example.com'; // <<< CHANGE THIS!

// SMTP Settings (Get these from your email provider)
$smtp_host = 'smtp.example.com';        // e.g., 'smtp.gmail.com' or your hosting provider's SMTP
$smtp_username = 'your_smtp_username@example.com'; // Often your full email address
$smtp_password = 'your_smtp_password_or_app_password'; // Your email/app password
$smtp_port = 587;                        // 587 for TLS, 465 for SSL
$smtp_encryption = PHPMailer::ENCRYPTION_STARTTLS; // PHPMailer::ENCRYPTION_SMTPS or false
$from_address = 'noreply@yourdomain.com'; // Email address the email is sent FROM
$from_name = 'Your Website Name';         // Name the email is sent FROM
// ********************************************************************


// --- Basic Security: Check Request Method ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die('Invalid request method.');
}

// --- Get and Sanitize Form Data ---
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$subject_line = isset($_POST['subject']) ? trim(strip_tags($_POST['subject'])) : '';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

// --- Server-Side Validation ---
if (empty($name) || empty($subject_line) || empty($message)) {
    http_response_code(400);
    die('Please fill in all required fields.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    die('Invalid email format provided.');
}

// --- Send Email using PHPMailer ---
$mail = new PHPMailer(true); // Enable exceptions

try {
    // Server settings
    // $mail->SMTPDebug = \PHPMailer\PHPMailer\SMTP::DEBUG_SERVER; // Enable verbose debug output for testing
    $mail->isSMTP();
    $mail->Host       = $smtp_host;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtp_username;
    $mail->Password   = $smtp_password;
    $mail->SMTPSecure = $smtp_encryption;
    $mail->Port       = $smtp_port;

    // Recipients
    $mail->setFrom($from_address, $from_name);      // Address it looks like it's FROM
    $mail->addAddress($receiving_email_address);    // Add the recipient (you)
    $mail->addReplyTo($email, $name);             // Set the Reply-To to the user's email/name

    // Content
    $mail->isHTML(false); // Send as plain text
    $mail->Subject = "New contact from $name: $subject_line";
    $mail->Body    = "You have received a new message from your website contact form.\n\n"
                   . "Name: $name\n"
                   . "Email: $email\n"
                   . "Subject: $subject_line\n\n"
                   . "Message:\n$message\n";
    // $mail->AltBody = 'This is the body in plain text for non-HTML mail clients'; // Optional

    $mail->send();
    // Success: Send the 'OK' message expected by validate.js
    echo 'OK';

} catch (Exception $e) {
    // Failure: Send a detailed error message (for debugging) or a generic one
    http_response_code(500);
    // IMPORTANT: Don't echo $mail->ErrorInfo in production, log it instead!
    error_log("Mailer Error: {$mail->ErrorInfo}"); // Log detailed error
    echo "Message could not be sent. Please try again later or contact us directly."; // Generic message to user
}

?>