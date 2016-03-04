<?php

	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
	header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
	header('Access-Control-Request-Headers');
	header('Access-Control-Request-Method');
		
	function checkCredentials($user, $psw, $db) {
		try {
			$sql = "SELECT * FROM utenti WHERE username='".$user."' AND password='".$psw."'";
			$result = $db->query($sql);
			if ($result->num_rows!=0) { 
				return true;
				}else{
				return false;
			}
		}
		catch(PDOException $e) {
			echo json_encode($e->getMessage());
			return false;
		}	
	}
	
	/* Non gestiamo le sessioni, il client deve inviare ogni volta le credenziali di accesso.
	Il server risponde solo se le credenziali sono corrette! Non abbiamo bisogno di una funzione di login esplicita*/
	
	$app->get('/{user}/{pass}/', function ($request, $response, $args){
		require_once 'lib/mysql.php';		
		$db = connect_db();
		$response = $response->withHeader('Content-type', 'application/json');
		
		if(checkCredentials($args['user'], $args['pass'], $db)){
			try{
				$response = $response->withStatus(200);
				$message =  '{"message": {"text": "Success!!"}}';
				$response = $response->write(json_encode($message));
			}catch(PDOException $e) {
				$response = $response->withStatus(404);
				$message =  '{"message": {"text": "'.$e->getMessage().'"}}';
				$response = $response->write($message);
			}			
		}else{
			$response = $response->withStatus(403);
			$message =  '{"message": {"text": "Accesso negato/Forbidden"}}';
			$response = $response->write($message);
		}
		return $response;
	});	
	
	$app->get('/{user}/{pass}/MarketList/{page}/', function ($request, $response, $args){
		require_once 'lib/mysql.php';
		
		$db = connect_db();
		$itemsToShow = 10;
		$offset = $args['page']*$itemsToShow;
		$response = $response->withHeader('Content-type', 'application/json');
		
		if(checkCredentials($args['user'], $args['pass'], $db)){
			$sql = "SELECT * FROM supermercati";
			try {
				$stmt = $db->prepare($sql);
				$stmt->execute();
				$resultSet = $stmt->get_result();
				$products = $resultSet->fetch_all(MYSQLI_ASSOC);//fetch_array(MYSQLI_ASSOC);
				$db = null;
				$json_array = array("results" => $products);
				
				$response = $response->withStatus(200);
				$response = $response->write(json_encode($json_array));
			}catch(PDOException $e) {
				$response = $response->withStatus(404);
				$message =  '{"message": {"text": "'.$e->getMessage().'"}}';
				$response = $response->write($message);
			}			
			}else{
				$response = $response->withStatus(403);
				$message =  '{"message": {"text": "Accesso negato/Forbidden"}}';
				$response = $response->write($message);
		}
	});
	
	$app->get('/{user}/{pass}/{market}/FlyerList/{page}/', function ($request, $response, $args){
		require_once 'lib/mysql.php';
		
		$db = connect_db();
		$itemsToShow = 10;
		$offset = $args['page']*$itemsToShow;
		$response = $response->withHeader('Content-type', 'application/json');
		
		if(checkCredentials($args['user'], $args['pass'], $db)){
			$sql = "SELECT * FROM volantini WHERE ID_supermercato = ".$args['market']."  LIMIT $itemsToShow OFFSET $offset";
			try {
				$stmt = $db->prepare($sql);
				$stmt->execute();
				$resultSet = $stmt->get_result();
				$flyer = $resultSet->fetch_all(MYSQLI_ASSOC);//fetch_array(MYSQLI_ASSOC);
				$db = null;
				$json_array = array("results" => $flyer);
				
				$response = $response->withStatus(200);
				$response = $response->write(json_encode($json_array));
			}catch(PDOException $e) {
				$response = $response->withStatus(404);
				$message =  '{"message": {"text": "'.$e->getMessage().'"}}';
				$response = $response->write($message);
			}			
			}else{
				$response = $response->withStatus(403);
				$message =  '{"message": {"text": "Accesso negato/Forbidden"}}';
				$response = $response->write($message);
		}
	});
	
	/* curl -H "Accept: application/json" -X GET http://127.0.0.1:8080/1/1/1/1/Products/1/ -i */
	$app->get('/{user}/{pass}/{market}/{flyer}/Products/{page}/', function ($request, $response, $args){
		require_once 'lib/mysql.php';
		//Controllo del ContentType richiesto dal Client
		$db = connect_db();
		$itemsToShow = 10;
		$offset = $args['page']*$itemsToShow;
		$basepath = getcwd()."/res";
		
		if(checkCredentials($args['user'], $args['pass'], $db)){
			switch($request->getHeaderLine('Accept')){
				case "application/pdf":
				$path = $basepath."/market_".$args['market']."/flyer_".$args['flyer']."/pdf_".$args['flyer'].".pdf";
				
				ob_clean();
				ob_start();
				try{
					$file = readfile($path);
					if(!$file) {
						throw new Exception('MalformedURLException');
					}
					$response = $response->withStatus(200);
					$response = $response->withHeader('Content-type', 'application/pdf'); 
					$response = $response->withHeader('Content-Description','File Transfer'); 
					$content = ob_get_clean();
					$response = $response->write($content);
					
					}catch(Exception $e) {
					$response = $response->withHeader('Content-type', 'application/json');
					$response = $response->withStatus(404);
					$message =  '{"message": {"text": "'.$e->getMessage().'"}}';
					$response = $response->write($message);
				}
				break;
				case "application/json": default:
				//$sql = "SELECT * FROM prodotti,volantini_prodotti WHERE ID_prodotto = (SELECT ID_prodotto FROM volantini_prodotti, volantini WHERE volantini_prodotti.ID_volantino = volantini.ID_volantino AND volantini.ID_volantino=".$args['flyer']." AND ID_supermercato = ".$args['market'].") LIMIT $offset, $itemsToShow";
				$sql = "SELECT volantini.ID_volantino, volantini.ID_supermercato, prodotti.*, volantini_prodotti.Prezzo, volantini_prodotti.Categoria  FROM volantini_prodotti, volantini, prodotti WHERE volantini_prodotti.ID_volantino = volantini.ID_volantino AND volantini_prodotti.ID_prodotto = prodotti.ID_prodotto AND volantini.ID_volantino=".$args['flyer']." AND ID_supermercato = ".$args['market']." LIMIT $offset, $itemsToShow";
				try {
					$stmt = $db->prepare($sql);
					$stmt->execute();
					$resultSet = $stmt->get_result();
					$products = $resultSet->fetch_all(MYSQLI_ASSOC);//fetch_array(MYSQLI_ASSOC);
					$db = null;
					$json_array = array("results" => $products);
					
					$response = $response->withHeader('Content-type', 'application/json');
					$response = $response->withStatus(200);
					$response = $response->write(json_encode($json_array));
					}catch(PDOException $e) {
					$response = $response->withHeader('Content-type', 'application/json');
					$response = $response->withStatus(404);
					$message =  '{"message": {"text": "'.$e->getMessage().'"}}';
					$response = $response->write($message);
				}			
			}			
			}else{
			$response = $response->withHeader('Content-type', 'application/json');
			$response = $response->withStatus(403);
			$message =  '{"message": {"text": "Accesso negato/Forbidden"}}';
			$response = $response->write($message);
		}	
		return $response;	
	});
	
	$app->post('/{user}/{pass}/{market}/{flyer}/', function ($request, $response, $args){
		require_once 'lib/mysql.php';
		$db = connect_db();		
		$parsedBody = $request->getParsedBody();
	
		if($parsedBody['filterby'] == "Descrizione")
			$toAttach = "AND descrizione LIKE  '%%".$parsedBody['toSearch']."%%'";
		else if($parsedBody['filterby'] == "Prezzo")
			$toAttach = "AND ( Prezzo BETWEEN ".$parsedBody['minPrice']." AND ".$parsedBody['maxPrice'].")";
		else if($parsedBody['filterby'] == "Categoria")
			$toAttach = "AND Categoria LIKE  '%%".$parsedBody['toSearch']."%%'";
		else if($parsedBody['filterby'] == "Nome")
			$toAttach = "AND Nome LIKE  '%%".$parsedBody['toSearch']."%%'";
		
		$query = "SELECT volantini.ID_volantino, volantini.ID_supermercato, prodotti.*, volantini_prodotti.Prezzo, volantini_prodotti.Categoria FROM volantini_prodotti, volantini, prodotti WHERE volantini_prodotti.ID_volantino = volantini.ID_volantino AND volantini_prodotti.ID_prodotto = prodotti.ID_prodotto AND volantini.ID_volantino=".$args['flyer']." AND ID_supermercato = ".$args['market']." ".$toAttach;
		try {
					$stmt = $db->prepare($query);
					$stmt->execute();
					$resultSet = $stmt->get_result();
					$products = $resultSet->fetch_all(MYSQLI_ASSOC);//fetch_array(MYSQLI_ASSOC);
					$db = null;
					$json_array = array("results" => $products);
					
					$response = $response->withHeader('Content-type', 'application/json');
					$response = $response->withStatus(200);
					$response = $response->write(json_encode($json_array));
				}catch(PDOException $e) {
					$response = $response->withHeader('Content-type', 'application/json');
					$response = $response->withStatus(404);
					$message =  '{"message": {"text": "'.$e->getMessage().'"}}';
					$response = $response->write($message);
				}			
		
			
			return $response;
		
	});
	
	$app->post('/SignUp/', function ($request, $response, $args){
		require_once 'lib/mysql.php';		
		$db = connect_db();
		$parsedBody = $request->getParsedBody();
		$response = $response->withHeader('Content-type', 'application/json');
		$sql = "INSERT INTO utenti (username, password, email) VALUES ('".$parsedBody['user']."','".$parsedBody['pass']."','".$parsedBody['email']."')";
		if(strpos($sql,"undefined") === -1){
			$response = $response->withStatus(400);
			$message =  '{"message": {"text": "'.$e->getMessage().'"}}';
			$response = $response->write($message);
		}else{
			try{
				$db->query($sql);
				$response = $response->withStatus(200);
				$message =  '{"message": {"text": "Success!!"}}';
				$response = $response->write(json_encode($message));
			}catch(PDOException $e) {
				$response = $response->withStatus(500);
				$message =  '{"message": {"text": "'.$e->getMessage().'"}}';
				$response = $response->write($message);
			}
		}
		return $response;
	});
	