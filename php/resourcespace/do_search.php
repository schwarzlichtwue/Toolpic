<?php
  header("Content-Type", "application/json");

  $query = $_GET["query"];

  // Set the private API key for the user (from the user account page) and the user we're accessing the system as.
  $private_key = "b29117e026633c0af8246a1234fb0fbbe0b0672f28e6e232d6c5e5d868e0c58a";
  $user = "Maurice";

  // Search for 'cat'
  $query = "user=" . $user . "&function=do_search&param1=" . rawurlencode($query);

  // Sign the query using the private key
  $sign = hash("sha256", $private_key . $query);

  //echo $sign;

  // Make the request and output the JSON results.
  $res = file_get_contents("https://bilder.fffutu.re/api/?" . $query . "&sign=" . $sign);

  print_r($res);
?>
