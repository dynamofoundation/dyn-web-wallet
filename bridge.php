<?php

		//echo $_SERVER['QUERY_STRING'];
		
		
        $ch = curl_init();

        // set url
        curl_setopt($ch, CURLOPT_URL, "http://192.168.1.117:8080/" . $_SERVER['QUERY_STRING']);

        if (isset($_POST['transaction'])) {
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS,"transaction=" . $_POST['transaction']);
        }

        //return the transfer as a string
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

        // $output contains the output string
        $output = curl_exec($ch);
		
		echo $output;

        // close curl resource to free up system resources
        curl_close($ch);  	

?>