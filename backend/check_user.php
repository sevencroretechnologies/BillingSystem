<?php
include 'vendor/autoload.php';
$app = include_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'admin@gmail.com';
$pass = 'Admin@123';

$user = User::where('email', $email)->first();

if (!$user) {
    echo "USER NOT FOUND in DB\n";
} else {
    echo "USER FOUND: " . $user->email . "\n";
    if (Hash::check($pass, $user->password)) {
        echo "PASSWORD MATCHES\n";
    } else {
        echo "PASSWORD MISMATCH\n";
        echo "Hash in DB: " . $user->password . "\n";
    }
}
