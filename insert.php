<?php
$servername = "database-1.czog4skiuai5.ap-south-1.rds.amazonaws.com";    // Or your DB endpoint if using AWS RDS
$username = "admin";        // Replace with your MySQL username
$password = "Chinmayi123";  // Replace with your MySQL password
$dbname = "mydb";       // Replace with your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get form data safely
$name = $_POST['name'];
$email = $_POST['email'];

// Insert query
$sql = "INSERT INTO users (name, email) VALUES ('$name', '$email')";

if ($conn->query($sql) === TRUE) {
    echo "New record created successfully<br>";
    echo "<a href='index.html'>Go Back</a>";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>

