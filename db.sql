CREATE TABLE ecom.users (
	id int NOT NULL,
	firstName varchar(50) NULL,
	lastName varchar(50) NULL,
	email varchar(255) NULL,
	password varchar(255) NULL,
	birthDate date NULL,
	isEmailConfirmed tinyint(1) NULL,
	emailConfirmationToken varchar(255) NULL,
	passwordLastUpdatedAt datetime NULL,
	passwordResetToken varchar(255) NULL,
	passwordResetTokenExpiresAt datetime NULL,
	isAdmin tinyint(1) NULL,
	createdAt timestamp NULL,
	isDeleted tinyint(1) NULL
);

INSERT INTO ecom.users (firstName,lastName,email,password,birthDate,isEmailConfirmed,emailConfirmationToken,passwordLastUpdatedAt,passwordResetToken,passwordResetTokenExpiresAt,isAdmin,createdAt,isDeleted) VALUES
	 ('John','Smith','john.smith@example.com','$2b$12$iPS5LOOVlvNkUfFEwMLsIu79rYsyql5kj9Ui5u9GkJwx0Dw0c8aFi','1995-07-21',0,'abc123confirmationtoken','2025-08-16 09:36:08','','2025-08-31 23:59:59',0,'2025-08-16 09:36:08',1),
	 ('Alice','Brown','alice.brown@example.com','$2b$10$V1OePQWZHVjB3K6O4G6yXOIbbvjD8FG4IYwMZfXgqgMKoYVt6kKau','1990-11-05',1,NULL,'2025-08-16 09:36:08','',NULL,1,'2025-08-16 09:36:08',0),
	 ('Michael','Anderson','michael.anderson@example.com','$2b$10$JpQkpBf3JpDgZpBpXv2uYuIyfJwHRFfRzQ3gHt3OZ9czdl0FEXO9O','2000-02-15',0,'tokenXYZ987','2025-08-16 09:36:08','','2025-12-31 23:59:59',1,'2025-08-16 09:36:08',0),
	 ('Emma','Johnson','emma.johnson@example.com','$2b$10$8v2L3PKxDROV3N/jlQhbVeRJcC4UOxFj3W6Y8MPoGZJt6F7G/y2Y6','1998-06-10',1,NULL,'2025-08-16 09:36:08','',NULL,0,'2025-08-16 09:36:08',0),
	 ('John','Doe','john.doe@example.com','$2b$10$MsIBN3eeWmsEQ8Rt1jG92uIe.uGqhwJc0zUngaKxWxuYbDi.g/uV6','1990-01-01',0,'$2b$10$kDmGOefQdf7F4B40WfBilOlngwA9oCJXN.GQrgS/wN9JZtEY5xr1m','2025-08-16 20:17:29','',NULL,0,'2025-08-16 20:38:01',0);
