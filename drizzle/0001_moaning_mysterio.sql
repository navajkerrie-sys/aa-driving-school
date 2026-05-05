CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(128) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`courseType` enum('beginner','intermediate','advanced','defensive','refresher') NOT NULL,
	`preferredDate` varchar(20) NOT NULL,
	`preferredTime` varchar(10) NOT NULL,
	`notes` text,
	`status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
	`paymentStatus` enum('unpaid','pending','paid','failed') NOT NULL DEFAULT 'unpaid',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`mpesaPhone` varchar(20) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`checkoutRequestId` varchar(128),
	`merchantRequestId` varchar(128),
	`mpesaReceiptNumber` varchar(64),
	`status` enum('initiated','pending','completed','failed','cancelled') NOT NULL DEFAULT 'initiated',
	`resultCode` varchar(10),
	`resultDesc` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
