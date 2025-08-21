CREATE TABLE
	users (
		id INT AUTO_INCREMENT PRIMARY KEY,
		firstName VARCHAR(50) NOT NULL CHECK (CHAR_LENGTH(firstName) >= 3),
		lastName VARCHAR(50) NOT NULL CHECK (CHAR_LENGTH(lastName) >= 3),
		email VARCHAR(255) NOT NULL UNIQUE,
		password VARCHAR(255) NOT NULL,
		birthDate NOT NULL DATE,
		isEmailConfirmed BOOLEAN NOT NULL DEFAULT FALSE,
		emailConfirmationToken NULL VARCHAR(255),
		passwordLastUpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		passwordResetToken VARCHAR(255) NULL DEFAULT '',
		passwordResetTokenExpiresAt NULL DATETIME,
		isAdmin BOOLEAN NOT NULL DEFAULT FALSE,
		isDeleted BOOLEAN NOT NULL DEFAULT FALSE,
		createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

INSERT INTO
	ecom.users (
		firstName,
		lastName,
		email,
		password,
		birthDate,
		isEmailConfirmed,
		emailConfirmationToken,
		passwordLastUpdatedAt,
		passwordResetToken,
		passwordResetTokenExpiresAt,
		isAdmin,
		createdAt,
		isDeleted
	)
VALUES
	(
		'John',
		'Smith',
		'john.smith@example.com',
		'$2b$12$iPS5LOOVlvNkUfFEwMLsIu79rYsyql5kj9Ui5u9GkJwx0Dw0c8aFi',
		'1995-07-21',
		0,
		'abc123confirmationtoken',
		'2025-08-16 09:36:08',
		'',
		'2025-08-31 23:59:59',
		0,
		'2025-08-16 09:36:08',
		1
	),
	(
		'Alice',
		'Brown',
		'alice.brown@example.com',
		'$2b$10$V1OePQWZHVjB3K6O4G6yXOIbbvjD8FG4IYwMZfXgqgMKoYVt6kKau',
		'1990-11-05',
		1,
		NULL,
		'2025-08-16 09:36:08',
		'',
		NULL,
		1,
		'2025-08-16 09:36:08',
		0
	),
	(
		'Michael',
		'Anderson',
		'michael.anderson@example.com',
		'$2b$10$JpQkpBf3JpDgZpBpXv2uYuIyfJwHRFfRzQ3gHt3OZ9czdl0FEXO9O',
		'2000-02-15',
		0,
		'tokenXYZ987',
		'2025-08-16 09:36:08',
		'',
		'2025-12-31 23:59:59',
		1,
		'2025-08-16 09:36:08',
		0
	),
	(
		'Emma',
		'Johnson',
		'emma.johnson@example.com',
		'$2b$10$8v2L3PKxDROV3N/jlQhbVeRJcC4UOxFj3W6Y8MPoGZJt6F7G/y2Y6',
		'1998-06-10',
		1,
		NULL,
		'2025-08-16 09:36:08',
		'',
		NULL,
		0,
		'2025-08-16 09:36:08',
		0
	),
	(
		'John',
		'Doe',
		'john.doe@example.com',
		'$2b$10$MsIBN3eeWmsEQ8Rt1jG92uIe.uGqhwJc0zUngaKxWxuYbDi.g/uV6',
		'1990-01-01',
		0,
		'$2b$10$kDmGOefQdf7F4B40WfBilOlngwA9oCJXN.GQrgS/wN9JZtEY5xr1m',
		'2025-08-16 20:17:29',
		'',
		NULL,
		0,
		'2025-08-16 20:38:01',
		0
	);

ALTER TABLE users 
MODIFY passwordResetTokenExpiresAt DATETIME NULL DEFAULT NULL;
ALTER TABLE users 
MODIFY passwordResetToken VARCHAR(255) NULL DEFAULT NULL;

SELECT * FROM users WHERE email = ?;

-- products
CREATE TABLE
	products (
		id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		price DECIMAL(7, 2) NOT NULL,
		discount DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
		description TEXT,
		withNursery BOOLEAN NOT NULL DEFAULT FALSE,
		amountOfSmallSize INT NOT NULL DEFAULT 0,
		amountOfLargeSize INT NOT NULL DEFAULT 0,
		isDeleted TINYINT (1) NOT NULL DEFAULT 0
	);

INSERT INTO
	products (
		name,
		price,
		discount,
		description,
		withNursery,
		amountOfSmallSize,
		amountOfLargeSize,
		isDeleted
	)
VALUES
	(
		'Monstera Deliciosa',
		34.99,
		0.15,
		'Swiss cheese plant with iconic split leaves',
		TRUE,
		12,
		8,
		0
	),
	(
		'Snake Plant',
		22.50,
		0.00,
		'Low-light tolerant air purifying succulent',
		FALSE,
		25,
		15,
		0
	),
	(
		'Fiddle Leaf Fig',
		89.99,
		0.20,
		'Trendy tree with large violin-shaped leaves',
		TRUE,
		5,
		18,
		0
	),
	(
		'Pothos Golden',
		12.99,
		0.10,
		'Easy-care trailing vine with heart-shaped leaves',
		FALSE,
		40,
		5,
		0
	),
	(
		'ZZ Plant',
		29.75,
		0.00,
		'Nearly indestructible drought-tolerant plant',
		TRUE,
		18,
		12,
		1
	),
	(
		'Peace Lily',
		27.50,
		0.25,
		'White flower-producing air purifier',
		TRUE,
		15,
		22,
		0
	),
	(
		'Aloe Vera',
		8.99,
		0.05,
		'Medicinal succulent with cooling gel',
		FALSE,
		50,
		3,
		0
	),
	(
		'Bird of Paradise',
		120.00,
		0.00,
		'Tropical plant with dramatic banana-like leaves',
		TRUE,
		3,
		14,
		0
	),
	(
		'Spider Plant',
		10.49,
		0.30,
		'Architectural plant with variegated grass-like leaves',
		FALSE,
		60,
		8,
		0
	),
	(
		'Rubber Plant',
		45.25,
		0.15,
		'Burgundy foliage perfect for bright spaces',
		TRUE,
		7,
		9,
		1
	);


-- 1. Add nullable column
ALTER TABLE products ADD COLUMN createdAt DATETIME NULL;

-- 2. Fill existing records with random times (Jan 1 - now)
UPDATE products SET createdAt = FROM_UNIXTIME(
    UNIX_TIMESTAMP('2023-01-01') + 
    RAND() * (UNIX_TIMESTAMP() - UNIX_TIMESTAMP('2023-01-01'))
);

-- 3. Set as NOT NULL with default
ALTER TABLE products 
MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- images
CREATE TABLE images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    fileName VARCHAR(255) NOT NULL,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

INSERT INTO images (productId, fileName) VALUES
(1, 'product-2-1.jpg'),
(1, 'product-4-2.jpg'),

(2, 'product-5-2.jpg'),
(2, 'product-3-2.jpg'),

(3, 'product-2-1.jpg'),
(3, 'product-5-2.jpg'),

(4, 'product-4-2.jpg'),

(5, 'product-3-2.jpg'),
(5, 'product-2-1.jpg'),

(6, 'product-4-2.jpg'),

(7, 'product-5-2.jpg'),
(7, 'product-3-2.jpg'),

(8, 'product-2-1.jpg'),

(9, 'product-4-2.jpg'),
(9, 'product-5-2.jpg'),

(10, 'product-3-2.jpg'),

(11, 'product-2-1.jpg'),
(11, 'product-4-2.jpg');

-- orders

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NULL,
    trackCode VARCHAR(50) NOT NULL UNIQUE,
    government VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    otherInfo TEXT DEFAULT NULL,
    phoneNumber VARCHAR(20) NOT NULL,
    secondPhoneNumber VARCHAR(20),
    status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    shipmentCost DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    issuedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_users FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO orders 
(userId, trackCode, government, city, address, otherInfo, phoneNumber, secondPhoneNumber, status, shipmentCost)
VALUES
(1, 'TRK1001', 'Cairo', 'Nasr City', '12 Abbas El Akkad St.', 'Leave with the doorman', '01001234567', '01122334455', 'Pending', 50.00),
(2, 'TRK1002', 'Giza', 'Dokki', '45 Tahrir St.', NULL, '01007654321', NULL, 'Processing', 30.00),
(NULL, 'TRK1003', 'Alexandria', 'Smouha', '23 El Horreya Rd.', 'Call before delivery', '01234567890', '01555555555', 'Shipped', 70.00),
(3, 'TRK1004', 'Dakahlia', 'Mansoura', 'El Gomhoria St., near Faculty of Medicine', NULL, '01099887766', NULL, 'Delivered', 10.00),
(NULL, 'TRK1005', 'Sharqia', 'Zagazig', 'Mostafa Kamel St., 3rd floor', 'Ring the bell twice', '01033445566', '01211223344', 'Cancelled', 0.00);

-- carts

CREATE TABLE carts (
    userId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (userId, productId),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (productId) REFERENCES products(id)
);

INSERT INTO carts (userId, productId, quantity)
SELECT u.userId, p.productId, FLOOR(1 + (RAND() * 5)) AS quantity
FROM (
    SELECT 1 AS userId UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 9 UNION ALL
    SELECT 10
) AS u
JOIN (
    SELECT 1 AS productId UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 5 UNION ALL
    SELECT 6 UNION ALL
    SELECT 7 UNION ALL
    SELECT 8 UNION ALL
    SELECT 9 UNION ALL
    SELECT 10 UNION ALL
    SELECT 11
) AS p
ORDER BY RAND()
LIMIT 30;
