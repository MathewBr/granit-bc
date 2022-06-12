<?php

require '../PHPMailer/PHPMailer.php';
require '../PHPMailer/SMTP.php';
require '../PHPMailer/Exception.php';

$name = $_POST['name'];
$email = $_POST['email'];
$text = $_POST['comment'];
$file = $_FILES['file'];

$title = "Заголовок письма";
$body = "
<h2>Новое письмо</h2>
<b>Имя:</b> $name<br>
<b>Почта:</b> $email<br><br>
<b>Сообщение:</b><br>$text
";

$mail = new PHPMailer\PHPMailer\PHPMailer();

try {
    $mail->isSMTP();
    $mail->CharSet = "UTF-8";
    $mail->SMTPAuth   = true;
    //$mail->SMTPDebug = 2;
    $mail->Debugoutput = function($str, $level) {$GLOBALS['status'][] = $str;};

    $mail->Host       = 'smtp.gmail.com';
    $mail->Username   = 'matvei7berezin@gmail.com';
    $mail->Password   = 'xkomfqdbefyuuqgm';
    $mail->SMTPSecure = 'ssl';
    $mail->Port       = 465;
    $mail->setFrom('mail@yandex.ru', 'Имя отправителя');

    $mail->addAddress('matvei_berezin@mail.ru');

    $rfile = '';
    $status = '';

if (!empty($file['name'])) {
        $uploadfile = tempnam(sys_get_temp_dir(), sha1($file['name']));
        $filename = $file['name'];
        if (move_uploaded_file($file['tmp_name'], $uploadfile)) {
            $mail->addAttachment($uploadfile, $filename);
            // $rfile[] = "Файл $filename прикреплён";
            $rfile = "Файл $filename прикреплён";
        } else {
            // $rfile[] = "Не удалось прикрепить файл $filename";
            $rfile = "Не удалось прикрепить файл $filename";
        }
}

$mail->isHTML(true);
$mail->Subject = $title;
$mail->Body = $body;

if ($mail->send()) {$result = "success";}
else {$result = "error";}

} catch (Exception $e) {
    $result = "error";
    $status = "Сообщение не было отправлено. Причина ошибки: {$mail->ErrorInfo}";
}

echo json_encode(["result" => $result, "resultfile" => $rfile, "status" => $status]);
?>