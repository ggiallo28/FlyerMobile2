<?php

function connect_db() {
	$server = 'localhost'; // this may be an ip address instead
	$user = 'root';
	$pass = '';
	$database = 'flyermobile';
	$connection = new mysqli($server, $user, $pass, $database);

	return $connection;
}

/*
	CREATE TABLE `FlyerMobile`.`Prodotti` ( `ID_prodotto` INT NOT NULL AUTO_INCREMENT , `Nome` VARCHAR(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL , `Descrizione` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL , `Prezzo` VARCHAR(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL , `Immagine` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL , PRIMARY KEY (`ID_prodotto`)) ENGINE = InnoDB;
	
	
	CREATE TABLE `FlyerMobile`.`Supermercati` ( `ID_supermercato` INT NOT NULL AUTO_INCREMENT , `Nome` VARCHAR(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL , `Indirizzo` VARCHAR(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL , PRIMARY KEY (`ID_supermercato`)) ENGINE = InnoDB;
	
	CREATE TABLE `flyermobile`.`Volantini` ( `ID_voltantino` INT NOT NULL AUTO_INCREMENT , `ID_supermercato` INT NOT NULL , `Data_Inizio` VARCHAR(11) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL , `Data_Fine` VARCHAR(11) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL , PRIMARY KEY (`ID_voltantino`)) ENGINE = InnoDB;


	*/