CREATE TABLE `item` (
  `item_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `icon` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `player` (
  `player_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `coins` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `player_inventory` (
  `player_inventory_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `quantity` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `player_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  PRIMARY KEY (`player_inventory_id`),
  CONSTRAINT `fk_player_inventory_player` FOREIGN KEY (`player_id`) REFERENCES `player` (`player_id`),
  CONSTRAINT `fk_player_inventory_item` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `starting_inventory` (
  `item_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `quantity` int(11) NOT NULL,
  PRIMARY KEY (`item_id`),
  CONSTRAINT `fk_starting_inventory_item` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `auction` (
  `auction_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `time_left` int(11) NOT NULL,
  `original_time_left` int(11) NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `initial_bid` int(11) NOT NULL,
  `winning_bid` int(11) DEFAULT NULL,
  `finished` tinyint(1) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `seller_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `bidder_id` bigint(20) DEFAULT NULL,
  `winner_id` bigint(20) DEFAULT NULL,
  `last_time_left_update` datetime NOT NULL,
  PRIMARY KEY (`auction_id`),
  CONSTRAINT `fk_auction_item` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`),
  CONSTRAINT `fk_auction_seller` FOREIGN KEY (`seller_id`) REFERENCES `player` (`player_id`),
  CONSTRAINT `fk_auction_bidder` FOREIGN KEY (`bidder_id`) REFERENCES `player` (`player_id`),
  CONSTRAINT `fk_auction_winner` FOREIGN KEY (`winner_id`) REFERENCES `player` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;